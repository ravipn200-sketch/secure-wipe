#include <algorithm>
#include <cstdint>
#include <filesystem>
#include <fstream>
#include <iostream>
#include <random>
#include <stdexcept>
#include <string>
#include <vector>

#include <openssl/evp.h>

namespace fs = std::filesystem;


// ============================================================
// SHA-256 CALCULATION
// ============================================================

static std::string calculateSHA256(
    const fs::path& path
) {
    std::ifstream file(
        path,
        std::ios::binary
    );

    if (!file) {
        throw std::runtime_error(
            "Unable to open file for SHA-256."
        );
    }

    EVP_MD_CTX* context =
        EVP_MD_CTX_new();

    if (!context) {
        throw std::runtime_error(
            "Unable to create SHA-256 context."
        );
    }

    if (
        EVP_DigestInit_ex(
            context,
            EVP_sha256(),
            nullptr
        ) != 1
    ) {
        EVP_MD_CTX_free(context);

        throw std::runtime_error(
            "SHA-256 initialization failed."
        );
    }

    const std::size_t blockSize =
        1024 * 1024;

    std::vector<char> buffer(
        blockSize
    );

    while (file) {

        file.read(
            buffer.data(),
            static_cast<std::streamsize>(
                buffer.size()
            )
        );

        const std::streamsize bytesRead =
            file.gcount();

        if (bytesRead > 0) {

            if (
                EVP_DigestUpdate(
                    context,
                    buffer.data(),
                    static_cast<std::size_t>(
                        bytesRead
                    )
                ) != 1
            ) {
                EVP_MD_CTX_free(context);

                throw std::runtime_error(
                    "SHA-256 update failed."
                );
            }
        }
    }

    unsigned char digest[
        EVP_MAX_MD_SIZE
    ];

    unsigned int digestLength = 0;

    if (
        EVP_DigestFinal_ex(
            context,
            digest,
            &digestLength
        ) != 1
    ) {
        EVP_MD_CTX_free(context);

        throw std::runtime_error(
            "SHA-256 finalization failed."
        );
    }

    EVP_MD_CTX_free(context);

    static const char hex[] =
        "0123456789abcdef";

    std::string result;

    result.reserve(
        digestLength * 2
    );

    for (
        unsigned int i = 0;
        i < digestLength;
        ++i
    ) {
        result +=
            hex[
                (digest[i] >> 4) & 0x0F
            ];

        result +=
            hex[
                digest[i] & 0x0F
            ];
    }

    return result;
}


// ============================================================
// WIPE METHODS
// ============================================================

enum class WipeMethod {
    SinglePassZero,
    SinglePassRandom,
    ThreePass
};


// ============================================================
// USAGE
// ============================================================

static void printUsage() {

    std::cout

        << "\n"
        << "SecureWipe Forensics - Safe Erasure Engine\n"
        << "============================================\n"
        << "TEST-IMAGE SAFETY BOUNDARY\n\n"

        << "Usage:\n"
        << "  erasure_engine.exe <test-image> <method>\n\n"

        << "Methods:\n"
        << "  zero     Single-pass zero overwrite\n"
        << "  random   Single-pass random overwrite\n"
        << "  three    Three-pass demonstration\n\n"

        << "Example:\n"
        << "  erasure_engine.exe testdata/erase_test_image.bin zero\n\n";
}


// ============================================================
// PARSE METHOD
// ============================================================

static bool parseMethod(
    const std::string& value,
    WipeMethod& method
) {

    if (value == "zero") {

        method =
            WipeMethod::SinglePassZero;

        return true;
    }

    if (value == "random") {

        method =
            WipeMethod::SinglePassRandom;

        return true;
    }

    if (value == "three") {

        method =
            WipeMethod::ThreePass;

        return true;
    }

    return false;
}


// ============================================================
// ZERO WRITER
// ============================================================

static void writeZeros(
    std::fstream& file,
    std::uint64_t size
) {

    const std::size_t blockSize =
        1024 * 1024;

    std::vector<char> buffer(
        blockSize,
        0
    );

    std::uint64_t remaining =
        size;

    while (remaining > 0) {

        const std::size_t amount =
            static_cast<std::size_t>(
                std::min<std::uint64_t>(
                    remaining,
                    blockSize
                )
            );

        file.write(
            buffer.data(),
            static_cast<std::streamsize>(
                amount
            )
        );

        if (!file) {

            throw std::runtime_error(
                "Zero overwrite failed."
            );
        }

        remaining -= amount;
    }
}


// ============================================================
// RANDOM WRITER
// ============================================================

static void writeRandom(
    std::fstream& file,
    std::uint64_t size
) {

    const std::size_t blockSize =
        1024 * 1024;

    std::vector<char> buffer(
        blockSize
    );

    std::random_device rd;

    std::mt19937 generator(
        rd()
    );

    std::uniform_int_distribution<int>
        distribution(
            0,
            255
        );

    std::uint64_t remaining =
        size;

    while (remaining > 0) {

        const std::size_t amount =
            static_cast<std::size_t>(
                std::min<std::uint64_t>(
                    remaining,
                    blockSize
                )
            );

        for (
            std::size_t i = 0;
            i < amount;
            ++i
        ) {

            buffer[i] =
                static_cast<char>(
                    distribution(generator)
                );
        }

        file.write(
            buffer.data(),
            static_cast<std::streamsize>(
                amount
            )
        );

        if (!file) {

            throw std::runtime_error(
                "Random overwrite failed."
            );
        }

        remaining -= amount;
    }
}


// ============================================================
// VERIFY ZEROES
// ============================================================

static bool verifyZeroes(
    const fs::path& path,
    std::uint64_t size
) {

    std::ifstream file(
        path,
        std::ios::binary
    );

    if (!file) {
        return false;
    }

    const std::size_t blockSize =
        1024 * 1024;

    std::vector<char> buffer(
        blockSize
    );

    std::uint64_t remaining =
        size;

    while (remaining > 0) {

        const std::size_t amount =
            static_cast<std::size_t>(
                std::min<std::uint64_t>(
                    remaining,
                    blockSize
                )
            );

        file.read(
            buffer.data(),
            static_cast<std::streamsize>(
                amount
            )
        );

        if (
            file.gcount() !=
            static_cast<std::streamsize>(
                amount
            )
        ) {
            return false;
        }

        for (
            std::size_t i = 0;
            i < amount;
            ++i
        ) {

            if (buffer[i] != 0) {
                return false;
            }
        }

        remaining -= amount;
    }

    return true;
}


// ============================================================
// AUDIT LOG
// ============================================================

static void writeAuditLog(
    const fs::path& target,
    std::uint64_t fileSize,
    WipeMethod method,
    const std::string& beforeHash,
    const std::string& afterHash,
    bool verified
) {

    const fs::path auditPath =
        target.string() +
        ".audit.txt";

    std::ofstream audit(
        auditPath
    );

    if (!audit) {

        throw std::runtime_error(
            "Unable to create audit record."
        );
    }

    audit
        << "SECUREWIPE FORENSICS\n"
        << "ERASURE AUDIT RECORD\n"
        << "====================\n\n";

    audit
        << "Target:\n"
        << target.string()
        << "\n\n";

    audit
        << "Size:\n"
        << fileSize
        << " bytes\n\n";

    audit
        << "Method:\n";

    if (
        method ==
        WipeMethod::SinglePassZero
    ) {

        audit
            << "Single-pass zero overwrite\n";
    }

    else if (
        method ==
        WipeMethod::SinglePassRandom
    ) {

        audit
            << "Single-pass random overwrite\n";
    }

    else {

        audit
            << "Three-pass demonstration\n";
    }

    audit
        << "\n";

    audit
        << "BEFORE SHA-256:\n"
        << beforeHash
        << "\n\n";

    audit
        << "AFTER SHA-256:\n"
        << afterHash
        << "\n\n";

    audit
        << "VERIFICATION:\n"
        << (
            verified
                ? "PASS"
                : "FAIL"
        )
        << "\n\n";

    audit
        << "PHYSICAL DISK ACCESS:\n"
        << "DISABLED\n\n";

    audit
        << "SAFETY MODE:\n"
        << "TEST IMAGE ONLY\n\n";

    audit
        << "STATUS:\n"
        << (
            verified
                ? "TEST IMAGE SANITIZED"
                : "NOT VERIFIED"
        )
        << "\n";

    audit.close();

    std::cout
        << "\nAUDIT RECORD CREATED:\n"
        << auditPath.string()
        << "\n";
}


// ============================================================
// MAIN
// ============================================================

int main(
    int argc,
    char* argv[]
) {

    std::cout

        << "\n"
        << "============================================\n"
        << "       SECUREWIPE FORENSICS ERASURE\n"
        << "============================================\n"
        << "SAFETY MODE: TEST IMAGE ONLY\n"
        << "PHYSICAL DISK ACCESS: DISABLED\n"
        << "============================================\n\n";


    // --------------------------------------------------------
    // ARGUMENT CHECK
    // --------------------------------------------------------

    if (argc != 3) {

        printUsage();

        return 1;
    }


    // --------------------------------------------------------
    // TARGET
    // --------------------------------------------------------

    fs::path target =
        argv[1];


    // --------------------------------------------------------
    // METHOD
    // --------------------------------------------------------

    WipeMethod method;

    if (
        !parseMethod(
            argv[2],
            method
        )
    ) {

        std::cerr
            << "ERROR: Unknown erasure method.\n";

        printUsage();

        return 1;
    }


    // --------------------------------------------------------
    // SAFETY ROOT
    // --------------------------------------------------------
    //
    // ONLY files inside:
    //
    //     core/testdata/
    //
    // are allowed.
    //
    // Physical disks are never opened.
    // --------------------------------------------------------

    const fs::path testRoot =
        fs::weakly_canonical(
            fs::path("testdata")
        );

    const fs::path canonicalTarget =
        fs::weakly_canonical(
            target
        );

    const std::string rootString =
        testRoot.generic_string();

    const std::string targetString =
        canonicalTarget.generic_string();


    if (
        targetString != rootString &&
        targetString.rfind(
            rootString + "/",
            0
        ) != 0
    ) {

        std::cerr

            << "\nSAFETY BLOCK:\n"
            << "Target is outside the authorized\n"
            << "testdata directory.\n\n"
            << "No data was modified.\n";

        return 2;
    }


    // --------------------------------------------------------
    // EXISTENCE CHECK
    // --------------------------------------------------------

    if (
        !fs::exists(
            canonicalTarget
        )
    ) {

        std::cerr

            << "ERROR: Test image does not exist:\n"
            << canonicalTarget.string()
            << "\n";

        return 1;
    }


    // --------------------------------------------------------
    // REGULAR FILE CHECK
    // --------------------------------------------------------

    if (
        !fs::is_regular_file(
            canonicalTarget
        )
    ) {

        std::cerr
            << "ERROR: Target is not a regular file.\n";

        return 1;
    }


    // --------------------------------------------------------
    // FILE SIZE
    // --------------------------------------------------------

    const std::uint64_t fileSize =
        fs::file_size(
            canonicalTarget
        );


    // --------------------------------------------------------
    // DISPLAY TARGET
    // --------------------------------------------------------

    std::cout

        << "Target:\n"
        << "  "
        << canonicalTarget.string()
        << "\n\n";

    std::cout

        << "Size:\n"
        << "  "
        << fileSize
        << " bytes\n\n";


    // --------------------------------------------------------
    // DISPLAY METHOD
    // --------------------------------------------------------

    std::cout
        << "Method:\n";


    if (
        method ==
        WipeMethod::SinglePassZero
    ) {

        std::cout
            << "  Single-pass zero overwrite\n";
    }

    else if (
        method ==
        WipeMethod::SinglePassRandom
    ) {

        std::cout
            << "  Single-pass random overwrite\n";
    }

    else {

        std::cout
            << "  Three-pass demonstration\n";
    }

    std::cout
        << "\n";


    // --------------------------------------------------------
    // WARNING
    // --------------------------------------------------------

    std::cout

        << "WARNING:\n"
        << "This will modify the TEST IMAGE.\n"
        << "The physical-disk safety boundary remains enabled.\n\n";


    // ========================================================
    // BEFORE SHA-256
    // ========================================================

    std::cout
        << "Calculating BEFORE SHA-256...\n";

    // IMPORTANT:
    // Declare this OUTSIDE the try block so that
    // the variable is available later in main().

    std::string beforeHash;

    try {

        beforeHash =
            calculateSHA256(
                canonicalTarget
            );

    }

    catch (
        const std::exception& error
    ) {

        std::cerr

            << "\nSHA-256 ERROR:\n"
            << error.what()
            << "\n";

        return 1;
    }

    std::cout

        << "BEFORE SHA-256:\n"
        << beforeHash
        << "\n\n";


    // ========================================================
    // ERASURE
    // ========================================================

    std::cout
        << "Starting sanitization...\n\n";


    auto performPass =
        [&](int passNumber,
            bool randomData) {

            std::fstream file(

                canonicalTarget,

                std::ios::in |
                std::ios::out |
                std::ios::binary
            );


            if (!file) {

                throw std::runtime_error(
                    "Unable to open test image for writing."
                );
            }


            file.seekp(0);


            if (randomData) {

                writeRandom(
                    file,
                    fileSize
                );
            }

            else {

                writeZeros(
                    file,
                    fileSize
                );
            }


            file.flush();


            if (!file) {

                file.close();

                throw std::runtime_error(
                    "Failed while flushing overwrite data."
                );
            }


            file.close();


            std::cout

                << "Pass "
                << passNumber
                << " completed.\n";
        };


    try {

        // ----------------------------------------------------
        // ZERO
        // ----------------------------------------------------

        if (
            method ==
            WipeMethod::SinglePassZero
        ) {

            performPass(
                1,
                false
            );
        }


        // ----------------------------------------------------
        // RANDOM
        // ----------------------------------------------------

        else if (
            method ==
            WipeMethod::SinglePassRandom
        ) {

            performPass(
                1,
                true
            );
        }


        // ----------------------------------------------------
        // THREE PASS
        // ----------------------------------------------------

        else if (
            method ==
            WipeMethod::ThreePass
        ) {

            performPass(
                1,
                true
            );

            performPass(
                2,
                false
            );

            performPass(
                3,
                true
            );
        }

    }

    catch (
        const std::exception& error
    ) {

        std::cerr

            << "\nERASURE ERROR:\n"
            << error.what()
            << "\n";

        return 1;
    }


    // ========================================================
    // AFTER SHA-256
    // ========================================================

    std::cout
        << "\nCalculating AFTER SHA-256...\n";


    // Declare outside try block.

    std::string afterHash;


    try {

        afterHash =
            calculateSHA256(
                canonicalTarget
            );

    }

    catch (
        const std::exception& error
    ) {

        std::cerr

            << "\nSHA-256 ERROR:\n"
            << error.what()
            << "\n";

        return 1;
    }


    std::cout

        << "AFTER SHA-256:\n"
        << afterHash
        << "\n\n";


    // ========================================================
    // VERIFICATION
    // ========================================================

    std::cout
        << "Verifying final state...\n\n";


    bool verified = false;


    // --------------------------------------------------------
    // ZERO VERIFICATION
    // --------------------------------------------------------

    if (
        method ==
        WipeMethod::SinglePassZero
    ) {

        const bool sizeOK =
            fs::exists(
                canonicalTarget
            ) &&
            fs::file_size(
                canonicalTarget
            ) == fileSize;


        const bool allZero =
            verifyZeroes(
                canonicalTarget,
                fileSize
            );


        const bool hashChanged =
            beforeHash != afterHash;


        std::cout

            << "SIZE CHECK: "
            << (
                sizeOK
                    ? "PASS"
                    : "FAIL"
            )
            << "\n";


        std::cout

            << "ZERO CONTENT CHECK: "
            << (
                allZero
                    ? "PASS"
                    : "FAIL"
            )
            << "\n";


        std::cout

            << "CONTENT HASH CHANGED: "
            << (
                hashChanged
                    ? "YES"
                    : "NO"
            )
            << "\n";


        verified =
            sizeOK &&
            allZero &&
            hashChanged;
    }


    // --------------------------------------------------------
    // RANDOM / THREE-PASS VERIFICATION
    // --------------------------------------------------------

    else {

        const bool fileIntact =
            fs::exists(
                canonicalTarget
            ) &&
            fs::file_size(
                canonicalTarget
            ) == fileSize;


        const bool contentChanged =
            beforeHash != afterHash;


        std::cout

            << "SIZE CHECK: "
            << (
                fileIntact
                    ? "PASS"
                    : "FAIL"
            )
            << "\n";


        std::cout

            << "CONTENT HASH CHANGED: "
            << (
                contentChanged
                    ? "YES"
                    : "NO"
            )
            << "\n";


        verified =
            fileIntact &&
            contentChanged;
    }


    // ========================================================
    // FINAL RESULT
    // ========================================================

    std::cout

        << "\n"
        << "============================================\n";


    if (verified) {

        std::cout

            << "VERIFICATION: PASS\n"
            << "STATUS: TEST IMAGE SANITIZED\n";
    }

    else {

        std::cout

            << "VERIFICATION: FAIL\n"
            << "STATUS: NOT VERIFIED\n";
    }


    std::cout

        << "PHYSICAL DISK ACCESS: DISABLED\n"
        << "SAFETY MODE: TEST IMAGE ONLY\n"
        << "============================================\n";


    // ========================================================
    // AUDIT RECORD
    // ========================================================

    try {

        writeAuditLog(

            canonicalTarget,

            fileSize,

            method,

            beforeHash,

            afterHash,

            verified
        );

    }

    catch (
        const std::exception& error
    ) {

        std::cerr

            << "\nAUDIT LOG ERROR:\n"
            << error.what()
            << "\n";

        return 1;
    }


    std::cout
        << "\n";


    return verified
        ? 0
        : 3;
}