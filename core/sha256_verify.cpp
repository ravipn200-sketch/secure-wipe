#include <openssl/sha.h>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <sstream>
#include <vector>
#include <string>

std::string sha256(const std::string& filename) {
    std::ifstream file(filename, std::ios::binary);

    if (!file) {
        return "";
    }

    SHA256_CTX ctx;
    SHA256_Init(&ctx);

    std::vector<unsigned char> buffer(1024 * 1024);

    while (file) {
        file.read(
            reinterpret_cast<char*>(buffer.data()),
            buffer.size()
        );

        std::streamsize bytes = file.gcount();

        if (bytes > 0) {
            SHA256_Update(
                &ctx,
                buffer.data(),
                static_cast<size_t>(bytes)
            );
        }
    }

    unsigned char hash[SHA256_DIGEST_LENGTH];

    SHA256_Final(hash, &ctx);

    std::ostringstream result;

    for (unsigned char byte : hash) {
        result << std::hex
               << std::setw(2)
               << std::setfill('0')
               << static_cast<int>(byte);
    }

    return result.str();
}

int main(int argc, char* argv[]) {

    std::cout << "=====================================\n";
    std::cout << " SECUREWIPE SHA-256 VERIFIER\n";
    std::cout << "=====================================\n";

    if (argc != 2) {
        std::cout << "Usage:\n";
        std::cout << "  sha256_verify <file>\n";
        return 1;
    }

    std::string filename = argv[1];

    std::string hash = sha256(filename);

    if (hash.empty()) {
        std::cerr << "ERROR: Cannot read file.\n";
        return 1;
    }

    std::cout << "File: " << filename << "\n";
    std::cout << "SHA-256: " << hash << "\n";
    std::cout << "=====================================\n";

    return 0;
}
