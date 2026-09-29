const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const dataDirectory = path.join(__dirname, "data");
const ledgerPath = path.join(dataDirectory, "ledger.json");

fs.mkdirSync(dataDirectory, { recursive: true });

// ============================================================
// SHA-256
// ============================================================

function sha256(data) {
    return crypto
        .createHash("sha256")
        .update(data, "utf8")
        .digest("hex");
}

// ============================================================
// BLOCK HASH
// ============================================================

function calculateBlockHash(block) {

    const { hash, ...blockWithoutHash } = block;

    return sha256(
        JSON.stringify(blockWithoutHash)
    );
}

// ============================================================
// LOAD LEDGER
// ============================================================

function loadLedger() {

    if (!fs.existsSync(ledgerPath)) {

        return {
            network: "SecureWipe-Forensics-Testnet",
            algorithm: "SHA-256",
            blocks: []
        };
    }

    return JSON.parse(
        fs.readFileSync(
            ledgerPath,
            "utf8"
        )
    );
}

// ============================================================
// SAVE LEDGER
// ============================================================

function saveLedger(ledger) {

    fs.writeFileSync(
        ledgerPath,
        JSON.stringify(ledger, null, 2),
        "utf8"
    );
}

// ============================================================
// INITIALIZE BLOCKCHAIN
// ============================================================

function initializeBlockchain() {

    const ledger = loadLedger();

    if (ledger.blocks.length === 0) {

        const genesisBlock = {

            index: 0,

            timestamp:
                new Date().toISOString(),

            type:
                "GENESIS",

            certificateHash:
                null,

            certificateId:
                null,

            target:
                "SECUREWIPE-BLOCKCHAIN",

            previousHash:
                "0".repeat(64),

            transactionId:
                "TX-GENESIS"
        };

        // IMPORTANT:
        // Calculate hash AFTER every Genesis field exists.

        genesisBlock.hash =
            calculateBlockHash(
                genesisBlock
            );

        ledger.network =
            "SecureWipe-Forensics-Testnet";

        ledger.algorithm =
            "SHA-256";

        ledger.blocks.push(
            genesisBlock
        );

        saveLedger(ledger);

        console.log(
            "Blockchain genesis block created."
        );
    }

    return ledger;
}

// ============================================================
// TRANSACTION ID
// ============================================================

function createTransactionId(certificateHash) {

    const prefix =
        certificateHash
            .substring(0, 16)
            .toUpperCase();

    const random =
        crypto
            .randomBytes(4)
            .toString("hex")
            .toUpperCase();

    return `TX-SWF-${prefix}-${random}`;
}

// ============================================================
// ANCHOR CERTIFICATE
// ============================================================

function anchorCertificate(certificate) {

    const ledger =
        initializeBlockchain();

    const existing =
        ledger.blocks.find(
            block =>
                block.certificateHash ===
                certificate.certificateHash
        );

    if (existing) {

        return {
            success: true,
            alreadyAnchored: true,
            block: existing
        };
    }

    const previousBlock =
        ledger.blocks[
            ledger.blocks.length - 1
        ];

    const block = {

        index:
            ledger.blocks.length,

        timestamp:
            new Date().toISOString(),

        type:
            "CERTIFICATE_ANCHOR",

        transactionId:
            createTransactionId(
                certificate.certificateHash
            ),

        certificateId:
            certificate.certificateId,

        certificateHash:
            certificate.certificateHash,

        target:
            certificate.target,

        method:
            certificate.method,

        verification:
            certificate.verification,

        auditRecordHash:
            certificate.auditRecordHash,

        issuer:
            "SecureWipe Forensics",

        network:
            "SecureWipe-Forensics-Testnet",

        previousHash:
            previousBlock.hash
    };

    block.hash =
        calculateBlockHash(block);

    ledger.blocks.push(block);

    saveLedger(ledger);

    return {
        success: true,
        alreadyAnchored: false,
        block
    };
}

// ============================================================
// VERIFY BLOCKCHAIN
// ============================================================

function verifyBlockchain() {

    const ledger =
        initializeBlockchain();

    const blocks =
        ledger.blocks;

    if (blocks.length === 0) {

        return {
            valid: false,
            checkedBlocks: 0,
            failedBlock: null,
            message:
                "Blockchain ledger is empty."
        };
    }

    for (
        let i = 0;
        i < blocks.length;
        i++
    ) {

        const current =
            blocks[i];

        const expectedPreviousHash =
            i === 0
                ? "0".repeat(64)
                : blocks[i - 1].hash;

        // Verify link to previous block

        if (
            current.previousHash !==
            expectedPreviousHash
        ) {

            return {
                valid: false,
                checkedBlocks: i + 1,
                failedBlock: current.index,
                message:
                    "Blockchain previous-hash verification failed."
            };
        }

        // Recalculate current block hash

        const calculatedHash =
            calculateBlockHash(
                current
            );

        if (
            calculatedHash !==
            current.hash
        ) {

            return {
                valid: false,
                checkedBlocks: i + 1,
                failedBlock: current.index,
                message:
                    "Blockchain block hash verification failed."
            };
        }
    }

    return {
        valid: true,
        checkedBlocks: blocks.length,
        failedBlock: null,
        lastTransaction:
            blocks[
                blocks.length - 1
            ].transactionId,
        message:
            "Blockchain integrity verified.",
        network:
            ledger.network,
        algorithm:
            ledger.algorithm
    };
}

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
    initializeBlockchain,
    anchorCertificate,
    verifyBlockchain,
    loadLedger
};

// ============================================================
// DIRECT TEST
// ============================================================

if (require.main === module) {

    const ledger =
        initializeBlockchain();

    console.log(
        "SecureWipe local blockchain initialized."
    );

    console.log(
        `Ledger: ${ledgerPath}`
    );

    console.log(
        `Blocks: ${ledger.blocks.length}`
    );

    console.log(
        verifyBlockchain()
    );
}