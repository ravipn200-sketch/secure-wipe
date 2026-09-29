#include <iostream>
#include <fstream>
#include <vector>
#include <string>
#include <filesystem>
#include <cstdint>
#include <iomanip>
#include <algorithm>

namespace fs = std::filesystem;

struct FoundFile {
    std::string type;
    std::string extension;
    uint64_t offset;
    uint64_t size;
    std::string outputFile;
};

bool matches(const std::vector<uint8_t>& data,
             size_t offset,
             const std::vector<uint8_t>& magic) {

    if (offset + magic.size() > data.size())
        return false;

    for (size_t i = 0; i < magic.size(); ++i) {
        if (data[offset + i] != magic[i])
            return false;
    }

    return true;
}

size_t findBytes(const std::vector<uint8_t>& data,
                 size_t start,
                 const std::vector<uint8_t>& pattern) {

    if (pattern.empty() || start >= data.size())
        return std::string::npos;

    for (size_t i = start; i + pattern.size() <= data.size(); ++i) {

        bool found = true;

        for (size_t j = 0; j < pattern.size(); ++j) {
            if (data[i + j] != pattern[j]) {
                found = false;
                break;
            }
        }

        if (found)
            return i;
    }

    return std::string::npos;
}

bool writeCarvedFile(const fs::path& path,
                     const std::vector<uint8_t>& data,
                     size_t start,
                     size_t end) {

    if (start >= end || end > data.size())
        return false;

    std::ofstream out(path, std::ios::binary);

    if (!out)
        return false;

    out.write(
        reinterpret_cast<const char*>(data.data() + start),
        static_cast<std::streamsize>(end - start)
    );

    return out.good();
}

bool carveJPEG(const std::vector<uint8_t>& data,
               size_t offset,
               size_t& end) {

    size_t marker = findBytes(
        data,
        offset + 3,
        {0xFF, 0xD9}
    );

    if (marker == std::string::npos)
        return false;

    end = marker + 2;
    return true;
}

bool carvePNG(const std::vector<uint8_t>& data,
              size_t offset,
              size_t& end) {

    const std::vector<uint8_t> iend = {
        0x49, 0x45, 0x4E, 0x44,
        0xAE, 0x42, 0x60, 0x82
    };

    size_t marker = findBytes(
        data,
        offset + 8,
        iend
    );

    if (marker == std::string::npos)
        return false;

    end = marker + iend.size();
    return true;
}

bool carvePDF(const std::vector<uint8_t>& data,
              size_t offset,
              size_t& end) {

    const std::vector<uint8_t> eof = {
        '%', '%', 'E', 'O', 'F'
    };

    size_t marker = findBytes(
        data,
        offset + 4,
        eof
    );

    if (marker == std::string::npos)
        return false;

    end = marker + eof.size();

    // Include a small amount of trailing whitespace.
    while (end < data.size() &&
           (data[end] == '\n' ||
            data[end] == '\r' ||
            data[end] == ' ' ||
            data[end] == '\t')) {
        ++end;
    }

    return true;
}

bool carveZIP(const std::vector<uint8_t>& data,
              size_t offset,
              size_t& end) {

    // End Of Central Directory:
    // PK 05 06
    const std::vector<uint8_t> eocd = {
        0x50, 0x4B, 0x05, 0x06
    };

    size_t marker = findBytes(
        data,
        offset + 4,
        eocd
    );

    if (marker == std::string::npos)
        return false;

    // EOCD structure is at least 22 bytes.
    if (marker + 22 > data.size())
        return false;

    // ZIP comment length is bytes 20-21.
    uint16_t commentLength =
        static_cast<uint16_t>(data[marker + 20]) |
        (static_cast<uint16_t>(data[marker + 21]) << 8);

    size_t possibleEnd =
        marker + 22 + commentLength;

    if (possibleEnd > data.size())
        return false;

    end = possibleEnd;

    return true;
}

int main(int argc, char* argv[]) {

    std::cout << "=============================================\n";
    std::cout << "     SECUREWIPE FORENSICS RECOVERY ENGINE\n";
    std::cout << "=============================================\n";
    std::cout << "MODE: READ-ONLY TEST IMAGE ANALYSIS\n";
    std::cout << "PHYSICAL DISK ACCESS: DISABLED\n";
    std::cout << "FILE CARVING: ENABLED\n";
    std::cout << "=============================================\n\n";

    if (argc < 2) {

        std::cout << "Usage:\n";
        std::cout
            << "recovery_engine <image> [output]\n\n";

        return 0;
    }

    fs::path imagePath = argv[1];

    fs::path outputDir =
        argc >= 3
        ? fs::path(argv[2])
        : fs::path("recovered");

    if (!fs::exists(imagePath)) {

        std::cerr
            << "ERROR: Image does not exist:\n"
            << imagePath
            << "\n";

        return 1;
    }

    std::ifstream file(
        imagePath,
        std::ios::binary
    );

    if (!file) {

        std::cerr
            << "ERROR: Cannot open image.\n";

        return 1;
    }

    std::cout << "[1/4] Reading image...\n";

    file.seekg(0, std::ios::end);

    std::streamoff fileSize =
        file.tellg();

    file.seekg(0, std::ios::beg);

    if (fileSize <= 0) {

        std::cerr
            << "ERROR: Empty image.\n";

        return 1;
    }

    std::vector<uint8_t> data(
        static_cast<size_t>(fileSize)
    );

    file.read(
        reinterpret_cast<char*>(data.data()),
        fileSize
    );

    file.close();

    std::cout
        << "       Size: "
        << data.size()
        << " bytes\n\n";

    std::cout << "[2/4] Searching file signatures...\n";

    std::vector<FoundFile> found;

    size_t recoveryNumber = 1;

    for (size_t offset = 0;
         offset < data.size();
         ++offset) {

        std::string type;
        std::string extension;

        size_t end = 0;

        // JPEG
        if (matches(
                data,
                offset,
                {0xFF, 0xD8, 0xFF})) {

            type = "JPEG";
            extension = ".jpg";

            if (!carveJPEG(data, offset, end))
                continue;
        }

        // PNG
        else if (matches(
                     data,
                     offset,
                     {
                         0x89, 0x50, 0x4E, 0x47,
                         0x0D, 0x0A, 0x1A, 0x0A
                     })) {

            type = "PNG";
            extension = ".png";

            if (!carvePNG(data, offset, end))
                continue;
        }

        // PDF
        else if (matches(
                     data,
                     offset,
                     {
                         0x25, 0x50, 0x44, 0x46
                     })) {

            type = "PDF";
            extension = ".pdf";

            if (!carvePDF(data, offset, end))
                continue;
        }

        // SQLite
        else if (matches(
                     data,
                     offset,
                     {
                         0x53, 0x51, 0x4C, 0x69,
                         0x74, 0x65, 0x20, 0x66,
                         0x6F, 0x72, 0x6D, 0x61,
                         0x74, 0x20, 0x33, 0x00
                     })) {

            /*
             * SQLite does not have a simple universal
             * end-of-file signature.
             *
             * We detect the database header here but
             * do not carve an arbitrary size.
             */
            type = "SQLite";
            extension = ".sqlite";

            std::cout
                << "       DETECTED SQLite"
                << " at offset "
                << offset
                << " (header only)\n";

            continue;
        }

        // ZIP / DOCX
        else if (matches(
                     data,
                     offset,
                     {
                         0x50, 0x4B, 0x03, 0x04
                     })) {

            type = "ZIP/DOCX";
            extension = ".zip";

            if (!carveZIP(data, offset, end))
                continue;
        }

        else {
            continue;
        }

        if (end <= offset)
            continue;

        size_t carvedSize =
            end - offset;

        // Safety limit for this prototype.
        const size_t MAX_CARVE =
            100ULL * 1024ULL * 1024ULL;

        if (carvedSize > MAX_CARVE) {

            std::cout
                << "       SKIPPED oversized "
                << type
                << " at offset "
                << offset
                << "\n";

            continue;
        }

        std::error_code ec;

        fs::create_directories(
            outputDir,
            ec
        );

        if (ec) {

            std::cerr
                << "ERROR creating output directory: "
                << ec.message()
                << "\n";

            return 1;
        }

        std::string filename =
            "recovered_" +
            std::to_string(recoveryNumber) +
            extension;

        fs::path outputPath =
            outputDir / filename;

        if (!writeCarvedFile(
                outputPath,
                data,
                offset,
                end)) {

            std::cerr
                << "       Failed to write "
                << outputPath
                << "\n";

            continue;
        }

        FoundFile result;

        result.type = type;
        result.extension = extension;
        result.offset = offset;
        result.size = carvedSize;
        result.outputFile = outputPath.string();

        found.push_back(result);

        std::cout
            << "       CARVED "
            << std::left
            << std::setw(10)
            << type
            << " offset="
            << offset
            << " size="
            << carvedSize
            << " bytes\n";

        recoveryNumber++;
    }

    std::cout << "\n[3/4] Recovery report\n";
    std::cout
        << "---------------------------------------------\n";

    std::cout
        << "Files carved: "
        << found.size()
        << "\n\n";

    if (!found.empty()) {

        for (size_t i = 0;
             i < found.size();
             ++i) {

            std::cout
                << "  "
                << (i + 1)
                << ". "
                << found[i].type
                << " "
                << found[i].extension
                << "\n";

            std::cout
                << "     Offset: "
                << found[i].offset
                << "\n";

            std::cout
                << "     Size: "
                << found[i].size
                << " bytes\n";

            std::cout
                << "     Output: "
                << found[i].outputFile
                << "\n\n";
        }
    }

    std::error_code ec;

    fs::create_directories(
        outputDir,
        ec
    );

    if (!ec) {

        fs::path reportPath =
            outputDir / "recovery_report.txt";

        std::ofstream report(
            reportPath
        );

        if (report) {

            report
                << "SECUREWIPE FORENSICS\n"
                << "RECOVERY REPORT\n";

            report
                << "==============================\n\n";

            report
                << "Source image: "
                << imagePath.string()
                << "\n";

            report
                << "Image size: "
                << data.size()
                << " bytes\n";

            report
                << "Files carved: "
                << found.size()
                << "\n\n";

            for (size_t i = 0;
                 i < found.size();
                 ++i) {

                report
                    << (i + 1)
                    << ". "
                    << found[i].type
                    << "\n";

                report
                    << "   Extension: "
                    << found[i].extension
                    << "\n";

                report
                    << "   Offset: "
                    << found[i].offset
                    << "\n";

                report
                    << "   Size: "
                    << found[i].size
                    << " bytes\n";

                report
                    << "   Output: "
                    << found[i].outputFile
                    << "\n\n";
            }

            report
                << "SOURCE IMAGE MODIFIED: NO\n";

            report
                << "PHYSICAL DISK ACCESS: DISABLED\n";

            report
                << "ANALYSIS MODE: READ-ONLY\n";

            report.close();

            std::cout
                << "Report: "
                << reportPath.string()
                << "\n";
        }
    }

    std::cout << "\n[4/4] Analysis complete\n";

    std::cout
        << "=============================================\n";

    std::cout
        << "SAFE MODE: SOURCE IMAGE NOT MODIFIED\n";

    std::cout
        << "=============================================\n";

    return 0;
}
