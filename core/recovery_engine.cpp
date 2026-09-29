#include <algorithm>
#include <cstdint>
#include <filesystem>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <sstream>
#include <string>
#include <vector>

namespace fs = std::filesystem;

struct DetectedFile {
    std::string type;
    std::string extension;
    std::uint64_t offset = 0;
    std::uint64_t estimatedSize = 0;
    std::string outputPath;
};

static bool hasBytes(
    const std::vector<unsigned char>& data,
    std::uint64_t offset,
    const std::vector<unsigned char>& signature
) {
    if (offset + signature.size() > data.size())
        return false;

    for (std::size_t i = 0; i < signature.size(); ++i) {
        if (data[offset + i] != signature[i])
            return false;
    }

    return true;
}

static std::string formatSize(std::uint64_t bytes) {
    std::ostringstream out;

    if (bytes >= 1024ULL * 1024ULL) {
        out << std::fixed << std::setprecision(2)
            << (static_cast<double>(bytes) / (1024.0 * 1024.0))
            << " MB";
    } else if (bytes >= 1024ULL) {
        out << std::fixed << std::setprecision(2)
            << (static_cast<double>(bytes) / 1024.0)
            << " KB";
    } else {
        out << bytes << " bytes";
    }

    return out.str();
}

static std::uint64_t findNextSignature(
    const std::vector<unsigned char>& data,
    std::uint64_t start
) {
    static const std::vector<std::vector<unsigned char>> signatures = {
        {'%', 'P', 'D', 'F', '-'},
        {0xFF, 0xD8, 0xFF},
        {0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A},
        {'P', 'K', 0x03, 0x04},
        {'S', 'Q', 'L', 'i', 't', 'e', ' ', 'f', 'o', 'r', 'm', 'a', 't', ' ', '3', 0x00}
    };

    for (std::uint64_t i = start; i < data.size(); ++i) {
        for (const auto& sig : signatures) {
            if (hasBytes(data, i, sig))
                return i;
        }
    }

    return data.size();
}

static std::uint64_t estimateEnd(
    const std::vector<unsigned char>& data,
    std::uint64_t offset,
    const std::string& type
) {
    // PDF
    if (type == "PDF") {
        const std::string endMarker = "%%EOF";

        for (std::uint64_t i = offset; i + endMarker.size() <= data.size(); ++i) {
            bool match = true;

            for (std::size_t j = 0; j < endMarker.size(); ++j) {
                if (data[i + j] !=
                    static_cast<unsigned char>(endMarker[j])) {
                    match = false;
                    break;
                }
            }

            if (match)
                return std::min<std::uint64_t>(
                    data.size(),
                    i + endMarker.size()
                );
        }
    }

    // JPEG
    if (type == "JPEG") {
        for (std::uint64_t i = offset + 3; i + 1 < data.size(); ++i) {
            if (data[i] == 0xFF && data[i + 1] == 0xD9)
                return i + 2;
        }
    }

    // PNG
    if (type == "PNG") {
        const unsigned char pngEnd[] = {
            0x00, 0x00, 0x00, 0x00,
            0x49, 0x45, 0x4E, 0x44,
            0xAE, 0x42, 0x60, 0x82
        };

        for (std::uint64_t i = offset + 8;
             i + sizeof(pngEnd) <= data.size();
             ++i) {

            bool match = true;

            for (std::size_t j = 0; j < sizeof(pngEnd); ++j) {
                if (data[i + j] != pngEnd[j]) {
                    match = false;
                    break;
                }
            }

            if (match)
                return i + sizeof(pngEnd);
        }
    }

    // SQLite database header does not have a simple universal
    // end marker, therefore estimate until the next known object.
    return findNextSignature(data, offset + 1);
}

static std::string extensionFor(const std::string& type) {
    if (type == "JPEG") return ".jpg";
    if (type == "PNG") return ".png";
    if (type == "PDF") return ".pdf";
    if (type == "DOCX/ZIP") return ".zip";
    if (type == "SQLite") return ".sqlite";

    return ".bin";
}

static void writeReport(
    const fs::path& reportPath,
    const fs::path& imagePath,
    const std::vector<DetectedFile>& files,
    std::uint64_t imageSize
) {
    std::ofstream report(reportPath);

    if (!report) {
        std::cerr << "ERROR: Cannot create recovery report.\n";
        return;
    }

    report << "SECUREWIPE FORENSICS RECOVERY REPORT\n";
    report << "====================================\n\n";

    report << "Analysis mode : READ-ONLY\n";
    report << "Physical disk : DISABLED\n";
    report << "Source image  : " << imagePath.string() << "\n";
    report << "Image size    : " << imageSize << " bytes\n";
    report << "Files found   : " << files.size() << "\n\n";

    report << "Detected objects\n";
    report << "-----------------\n";

    for (std::size_t i = 0; i < files.size(); ++i) {
        const auto& f = files[i];

        report << (i + 1) << ". "
               << f.type
               << " "
               << f.extension
               << " @ offset "
               << f.offset
               << " | estimated size "
               << f.estimatedSize
               << " bytes\n";

        report << "   Output: "
               << f.outputPath
               << "\n";
    }

    report << "\nSafety verification\n";
    report << "--------------------\n";
    report << "Source image modified : NO\n";
    report << "Physical storage modified : NO\n";
    report << "Recovery operation : READ-ONLY\n";

    report.close();
}

int main(int argc, char* argv[]) {

    std::cout
        << "\n==============================================\n"
        << "      SECUREWIPE FORENSICS RECOVERY ENGINE\n"
        << "==============================================\n"
        << "MODE: READ-ONLY TEST IMAGE ANALYSIS\n"
        << "PHYSICAL DISK ACCESS: DISABLED\n"
        << "==============================================\n\n";

    if (argc < 2 || argc > 3) {
        std::cout
            << "Usage:\n"
            << "  recovery_engine.exe <image> [output]\n\n"
            << "Example:\n"
            << "  recovery_engine.exe testdata/test_image.bin "
               "testdata/backend_recovered\n\n";

        return 1;
    }

    fs::path imagePath = argv[1];

    fs::path outputDir;

    if (argc == 3) {
        outputDir = argv[2];
    } else {
        outputDir = "recovered";
    }

    if (!fs::exists(imagePath)) {
        std::cerr
            << "ERROR: Source image does not exist:\n"
            << imagePath.string()
            << "\n";

        return 1;
    }

    if (!fs::is_regular_file(imagePath)) {
        std::cerr
            << "ERROR: Source is not a regular image file.\n";

        return 1;
    }

    std::ifstream input(imagePath, std::ios::binary);

    if (!input) {
        std::cerr
            << "ERROR: Cannot open source image.\n";

        return 1;
    }

    input.seekg(0, std::ios::end);
    const std::streamoff size = input.tellg();
    input.seekg(0, std::ios::beg);

    if (size <= 0) {
        std::cerr
            << "ERROR: Image is empty.\n";

        return 1;
    }

    std::vector<unsigned char> data(
        static_cast<std::size_t>(size)
    );

    input.read(
        reinterpret_cast<char*>(data.data()),
        size
    );

    input.close();

    std::cout << "[1/3] Reading image...\n";
    std::cout << "      Size: "
              << data.size()
              << " bytes ("
              << formatSize(data.size())
              << ")\n\n";

    fs::create_directories(outputDir);

    std::cout << "[2/3] Searching forensic signatures...\n";

    std::vector<DetectedFile> detected;

    struct Signature {
        std::string type;
        std::vector<unsigned char> bytes;
    };

    const std::vector<Signature> signatures = {

        {
            "JPEG",
            {0xFF, 0xD8, 0xFF}
        },

        {
            "PNG",
            {
                0x89, 'P', 'N', 'G',
                0x0D, 0x0A, 0x1A, 0x0A
            }
        },

        {
            "PDF",
            {'%', 'P', 'D', 'F', '-'}
        },

        {
            "DOCX/ZIP",
            {'P', 'K', 0x03, 0x04}
        },

        {
            "SQLite",
            {
                'S', 'Q', 'L', 'i',
                't', 'e', ' ',
                'f', 'o', 'r', 'm',
                'a', 't', ' ',
                '3', 0x00
            }
        }
    };

    for (std::uint64_t offset = 0;
         offset < data.size();
         ++offset) {

        for (const auto& signature : signatures) {

            if (!hasBytes(data, offset, signature.bytes))
                continue;

            bool duplicate = false;

            for (const auto& existing : detected) {
                if (existing.offset == offset &&
                    existing.type == signature.type) {
                    duplicate = true;
                    break;
                }
            }

            if (duplicate)
                continue;

            DetectedFile file;

            file.type = signature.type;
            file.extension = extensionFor(signature.type);
            file.offset = offset;

            const std::uint64_t end =
                estimateEnd(
                    data,
                    offset,
                    signature.type
                );

            if (end > offset)
                file.estimatedSize = end - offset;
            else
                file.estimatedSize = data.size() - offset;

            std::ostringstream name;

            name << "recovered_"
                 << std::setw(4)
                 << std::setfill('0')
                 << detected.size() + 1
                 << file.extension;

            fs::path destination =
                outputDir / name.str();

            file.outputPath =
                destination.string();

            // Write only the carved region.
            std::ofstream output(
                destination,
                std::ios::binary
            );

            if (output) {

                const std::uint64_t endOffset =
                    std::min<std::uint64_t>(
                        data.size(),
                        offset + file.estimatedSize
                    );

                output.write(
                    reinterpret_cast<const char*>(
                        data.data() + offset
                    ),
                    static_cast<std::streamsize>(
                        endOffset - offset
                    )
                );

                output.close();
            }

            std::cout
                << "      FOUND "
                << file.type
                << " at offset "
                << file.offset
                << " | "
                << formatSize(file.estimatedSize)
                << "\n";

            detected.push_back(file);

            break;
        }
    }

    std::cout << "\n[3/3] Recovery report\n";
    std::cout
        << "----------------------------------------------\n";

    std::cout
        << "Files found: "
        << detected.size()
        << "\n\n";

    if (detected.empty()) {

        std::cout
            << "No supported forensic signatures found.\n";

    } else {

        std::cout
            << "Detected objects:\n";

        for (std::size_t i = 0;
             i < detected.size();
             ++i) {

            std::cout
                << "  "
                << i + 1
                << ". "
                << detected[i].type
                << " "
                << detected[i].extension
                << " @ "
                << detected[i].offset
                << " bytes"
                << " | "
                << formatSize(
                    detected[i].estimatedSize
                )
                << "\n";
        }
    }

    fs::path reportPath =
        outputDir / "recovery_report.txt";

    writeReport(
        reportPath,
        imagePath,
        detected,
        data.size()
    );

    std::cout
        << "\nRecovery report written to:\n"
        << reportPath.string()
        << "\n\n";

    std::cout
        << "==============================================\n"
        << "SAFE MODE: SOURCE IMAGE NOT MODIFIED\n"
        << "SAFE MODE: PHYSICAL DISK ACCESS DISABLED\n"
        << "==============================================\n\n";

    return 0;
}