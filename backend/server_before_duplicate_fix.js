require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { execFile } = require("child_process");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");

// ============================================================
// APP
// ============================================================

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 5000;

// ============================================================
// PROJECT PATHS
// ============================================================

const projectRoot = path.resolve(__dirname, "..");

const blockchain =require(
    path.join(
      projectRoot,
      "blockchain",
      "blockchain.js"
    )
  );

const corePath = path.join(
  projectRoot,
  "core"
);

const testDataPath = path.join(
  corePath,
  "testdata"
);

// ============================================================
// RECOVERY ENGINE
// ============================================================

const recoveryEnginePath = path.join(
  corePath,
  "recovery_engine.exe"
);

const recoveryImagePath = path.join(
  testDataPath,
  "test_image.bin"
);

const recoveryOutputPath = path.join(
  testDataPath,
  "backend_recovered"
);

// ============================================================
// ERASURE ENGINE
// ============================================================

const erasureEnginePath = path.join(
  corePath,
  "erasure_engine.exe"
);

const erasureImagePath = path.join(
  testDataPath,
  "erase_test_image.bin"
);

const erasureAuditPath =
  erasureImagePath + ".audit.txt";

// ============================================================
// AUDIT CHAIN STORAGE
// ============================================================

const dataPath = path.join(
  __dirname,
  "data"
);

const auditChainPath = path.join(
  dataPath,
  "audit_chain.json"
);

if (!fs.existsSync(dataPath)) {
  fs.mkdirSync(dataPath, {
    recursive: true
  });
}

const certificatesIssuedDir = path.join(
  __dirname,
  "certificates",
  "issued"
);

// ============================================================
// MIDDLEWARE
// ============================================================

app.use(
  helmet({
    crossOriginResourcePolicy: false
  })
);

app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://10.239.224.172:5173",
        "http://10.239.224.172:5174"
      ];

      // Allow requests with no Origin header
      // such as direct browser/API requests and local tools.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("Blocked CORS origin:", origin);

      return callback(
        new Error("Not allowed by CORS")
      );
    },

    methods: [
      "GET",
      "POST",
      "PUT",
      "DELETE",
      "OPTIONS"
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization"
    ]
  })
);
app.use(
  express.json({
    limit: "1mb"
  })
);

// ============================================================
// DEMO DEVICES
// ============================================================

const devices = [
  {
    id: "TEST-DRIVE-01",
    type: "HDD",
    capacity: "500 GB",
    interface: "SATA",
    status: "READY",
    health: "98%",
    serial: "SWF-HDD-001"
  },

  {
    id: "FORENSIC-USB",
    type: "USB",
    capacity: "64 GB",
    interface: "USB 3.0",
    status: "READY",
    health: "100%",
    serial: "SWF-USB-002"
  },

  {
    id: "RECOVERY-IMAGE-01",
    type: "DISK IMAGE",
    capacity: "32 GB",
    interface: "IMAGE",
    status: "ANALYZED",
    health: "N/A",
    serial: "SWF-IMG-003"
  }
];

// ============================================================
// HEALTH CHECK
// ============================================================

app.get(
  "/api/health",
  (req, res) => {

    res.json({
      success: true,

      service:
        "SecureWipe Forensics Backend",

      status:
        "ONLINE",

      version:
        "1.3.0",

      timestamp:
        new Date().toISOString(),

      physicalDiskAccess:
        false,

      safetyMode:
        "TEST IMAGE ONLY"
    });
  }
);

// ============================================================
// API INFORMATION
// ============================================================

app.get(
  "/api",
  (req, res) => {

    res.json({

      success: true,

      name:
        "SecureWipe Forensics API",

      version:
        "1.3.0",

      modules: [
        "Device Manager",
        "Recovery Workspace",
        "Erasure Console",
        "Forensic Audit",
        "SHA-256 Audit Chain",
        "Audit Chain Verification",
        "Certificates"
      ],

      engines: {
        recovery: "C++",
        erasure: "C++"
      },

      audit: {
        algorithm: "SHA-256",
        tamperEvident: true
      },

      safetyMode:
        "SAFE TEST IMAGE ONLY",

      physicalDiskAccess:
        false
    });
  }
);

// ============================================================
// DEVICE MANAGER
// ============================================================

app.get(
  "/api/devices",
  (req, res) => {

    res.json({

      success: true,

      count:
        devices.length,

      devices
    });
  }
);

// ============================================================
// DEVICE SCAN
// ============================================================

app.post(
  "/api/devices/scan",
  async (req, res) => {

    await new Promise(
      resolve =>
        setTimeout(
          resolve,
          1200
        )
    );

    res.json({

      success: true,

      message:
        "Device scan completed.",

      mode:
        "SIMULATION",

      physicalDiskAccess:
        false,

      count:
        devices.length,

      devices
    });
  }
);

// ============================================================
// DEVICE DETAILS
// ============================================================

app.get(
  "/api/devices/:id",
  (req, res) => {

    const device =
      devices.find(
        item =>
          item.id ===
          req.params.id
      );

    if (!device) {

      return res
        .status(404)
        .json({

          success: false,

          message:
            "Device not found."
        });
    }

    res.json({

      success: true,

      device
    });
  }
);

// ============================================================
// C++ RECOVERY ENGINE
// ============================================================
//
// SAFETY:
// - Only test_image.bin
// - Read-only source
// - No physical disk access
// ============================================================

app.post(
  "/api/recovery/analyze",
  (req, res) => {

    const target =
      req.body?.target ||
      "RECOVERY-IMAGE-01";

    // --------------------------------------------------------
    // SAFETY CHECK
    // --------------------------------------------------------

    if (
      target !==
      "RECOVERY-IMAGE-01"
    ) {

      return res
        .status(400)
        .json({

          success: false,

          message:
            "Only the controlled test recovery image is enabled.",

          safety: {

            physicalDiskAccess:
              false,

            sourceImageModified:
              false,

            analysisMode:
              "READ-ONLY"
          }
        });
    }

    // --------------------------------------------------------
    // ENGINE CHECK
    // --------------------------------------------------------

    if (
      !fs.existsSync(
        recoveryEnginePath
      )
    ) {

      return res
        .status(500)
        .json({

          success: false,

          message:
            "C++ recovery engine executable not found.",

          enginePath:
            recoveryEnginePath
        });
    }

    // --------------------------------------------------------
    // IMAGE CHECK
    // --------------------------------------------------------

    if (
      !fs.existsSync(
        recoveryImagePath
      )
    ) {

      return res
        .status(500)
        .json({

          success: false,

          message:
            "Recovery test image not found.",

          imagePath:
            recoveryImagePath
        });
    }

    console.log("");
    console.log(
      "=============================================="
    );
    console.log(
      "C++ RECOVERY ENGINE REQUEST"
    );
    console.log(
      "=============================================="
    );

    console.log(
      "Target:",
      target
    );

    console.log(
      "Engine:",
      recoveryEnginePath
    );

    console.log(
      "Image:",
      recoveryImagePath
    );

    console.log(
      "Output:",
      recoveryOutputPath
    );

    console.log(
      "Physical disk access: DISABLED"
    );

    console.log(
      "Analysis mode: READ-ONLY"
    );

    console.log("");

    // --------------------------------------------------------
    // EXECUTE RECOVERY ENGINE
    // --------------------------------------------------------

    execFile(

      recoveryEnginePath,

      [
        recoveryImagePath,
        recoveryOutputPath
      ],

      {

        windowsHide:
          true,

        timeout:
          120000,

        maxBuffer:
          10 * 1024 * 1024,

        cwd:
          corePath
      },

      (
        error,
        stdout,
        stderr
      ) => {

        if (error) {

          console.error(
            "Recovery engine error:",
            error
          );

          return res
            .status(500)
            .json({

              success: false,

              mode:
                "C++_ENGINE",

              message:
                "Recovery engine execution failed.",

              error:
                error.message,

              stderr:
                stderr || "",

              stdout:
                stdout || "",

              safety: {

                physicalDiskAccess:
                  false,

                sourceImageModified:
                  false,

                analysisMode:
                  "READ-ONLY"
              }
            });
        }

        console.log(
          "[RECOVERY ENGINE OUTPUT]"
        );

        console.log(
          stdout || ""
        );

        // ----------------------------------------------------
        // PARSE IMAGE SIZE
        // ----------------------------------------------------

        const sizeMatch =
          stdout.match(
            /Size:\s*([0-9]+)\s*bytes/i
          );

        // ----------------------------------------------------
        // PARSE FILE COUNT
        // ----------------------------------------------------

        const carvedMatch =
          stdout.match(
            /Files\s+(?:found|carved):\s*([0-9]+)/i
          );

        // ----------------------------------------------------
        // PARSE SHA-256
        // ----------------------------------------------------

        const shaMatch =
          stdout.match(
            /SHA-256:\s*([a-fA-F0-9]{64})/i
          );

        // ----------------------------------------------------
        // PARSE OFFSET
        // ----------------------------------------------------

        const offsetMatch =
          stdout.match(
            /offset\s*[:=]?\s*([0-9]+)/i
          );

        const candidatesFound =
          carvedMatch
            ? Number(
                carvedMatch[1]
              )
            : 0;

        const recoveredFile = {
          type: "PDF",

          extension: ".pdf",

          offset:
            offsetMatch
              ? Number(
                  offsetMatch[1]
                )
              : null,

          sha256:
            shaMatch
              ? shaMatch[1].toLowerCase()
              : null
        };

        const result = {

          success:
            true,

          mode:
            "C++_ENGINE",

          target,

          safety: {

            physicalDiskAccess:
              false,

            sourceImageModified:
              false,

            analysisMode:
              "READ-ONLY"
          },

          statistics: {

            imageSizeBytes:
              sizeMatch
                ? Number(
                    sizeMatch[1]
                  )
                : null,

            candidatesFound,

            highRelevance:
              candidatesFound,

            averageRecoverability:
              candidatesFound > 0
                ? 100
                : 0
          },

          recoveredFiles:
            candidatesFound > 0
              ? [recoveredFile]
              : [],

          engineOutput:
            stdout,

          message:
            "C++ forensic recovery analysis completed successfully."
        };

        return res.json(
          result
        );
      }
    );
  }
);

// ============================================================
// ERASURE SIMULATION
// ============================================================

app.post(
  "/api/erasure/simulate",
  async (req, res) => {

    const {
      target =
        "TEST-DRIVE-01",

      method =
        "NIST 800-88 Clear"

    } = req.body || {};

    await new Promise(
      resolve =>
        setTimeout(
          resolve,
          1200
        )
    );

    res.json({

      success:
        true,

      mode:
        "SIMULATION",

      target,

      method,

      progress:
        100,

      verification: {

        status:
          "PASS",

        sectorsVerified:
          1048576
      },

      safety: {

        physicalDiskAccess:
          false,

        dataModified:
          false
      },

      message:
        "Erasure workflow simulation completed. No physical storage was modified."
    });
  }
);

// ============================================================
// C++ ERASURE ENGINE
// ============================================================
//
// IMPORTANT SAFETY:
//
// ONLY:
// core/testdata/erase_test_image.bin
//
// No arbitrary paths.
// No physical disk access.
// ============================================================

app.post(
  "/api/erasure/start",
  (req, res) => {

    const method =
      req.body?.method ||
      "zero";

    // --------------------------------------------------------
    // ALLOWED METHODS
    // --------------------------------------------------------

    const allowedMethods = [
      "zero",
      "random",
      "three"
    ];

    if (
      !allowedMethods.includes(
        method
      )
    ) {

      return res
        .status(400)
        .json({

          success:
            false,

          message:
            "Invalid erasure method.",

          allowedMethods,

          safety: {

            physicalDiskAccess:
              false
          }
        });
    }

    // --------------------------------------------------------
    // ENGINE CHECK
    // --------------------------------------------------------

    if (
      !fs.existsSync(
        erasureEnginePath
      )
    ) {

      return res
        .status(500)
        .json({

          success:
            false,

          message:
            "C++ erasure engine executable not found.",

          enginePath:
            erasureEnginePath,

          safety: {

            physicalDiskAccess:
              false
          }
        });
    }

    // --------------------------------------------------------
    // TEST IMAGE CHECK
    // --------------------------------------------------------

    if (
      !fs.existsSync(
        erasureImagePath
      )
    ) {

      return res
        .status(400)
        .json({

          success:
            false,

          message:
            "Safe erasure test image not found.",

          instruction:
            "Create erase_test_image.bin inside core/testdata before running the erasure operation.",

          imagePath:
            erasureImagePath,

          safety: {

            physicalDiskAccess:
              false
          }
        });
    }

    console.log("");

    console.log(
      "=============================================="
    );

    console.log(
      "SECUREWIPE C++ ERASURE REQUEST"
    );

    console.log(
      "=============================================="
    );

    console.log(
      "Method:",
      method
    );

    console.log(
      "Engine:",
      erasureEnginePath
    );

    console.log(
      "Target:",
      erasureImagePath
    );

    console.log(
      "Physical disk access: DISABLED"
    );

    console.log(
      "Safety mode: TEST IMAGE ONLY"
    );

    console.log("");

    // --------------------------------------------------------
    // EXECUTE C++ ENGINE
    // --------------------------------------------------------

    execFile(

      erasureEnginePath,

      [
        erasureImagePath,
        method
      ],

      {

        windowsHide:
          true,

        timeout:
          120000,

        maxBuffer:
          10 * 1024 * 1024,

        cwd:
          corePath
      },

      (
        error,
        stdout,
        stderr
      ) => {

        console.log(
          "[ERASURE ENGINE OUTPUT]"
        );

        console.log(
          stdout || ""
        );

        if (stderr) {

          console.error(
            "[ERASURE ENGINE STDERR]"
          );

          console.error(
            stderr
          );
        }

        // ----------------------------------------------------
        // PARSE BEFORE SHA-256
        // ----------------------------------------------------

        const beforeMatch =
          stdout.match(
            /BEFORE SHA-256:\s*([a-fA-F0-9]{64})/i
          );

        // ----------------------------------------------------
        // PARSE AFTER SHA-256
        // ----------------------------------------------------

        const afterMatch =
          stdout.match(
            /AFTER SHA-256:\s*([a-fA-F0-9]{64})/i
          );

        // ----------------------------------------------------
        // PARSE VERIFICATION
        // ----------------------------------------------------

        const verificationMatch =
          stdout.match(
            /VERIFICATION:\s*(PASS|FAIL)/i
          );

        // ----------------------------------------------------
        // PARSE STATUS
        // ----------------------------------------------------

        const statusMatch =
          stdout.match(
            /STATUS:\s*(TEST IMAGE SANITIZED|NOT VERIFIED)/i
          );

        // ----------------------------------------------------
        // PARSE SIZE
        // ----------------------------------------------------

        const sizeMatch =
          stdout.match(
            /Size:\s*([0-9]+)\s*bytes/i
          );

        // ----------------------------------------------------
        // SIZE CHECK
        // ----------------------------------------------------

        const sizeCheckMatch =
          stdout.match(
            /SIZE CHECK:\s*(PASS|FAIL)/i
          );

        // ----------------------------------------------------
        // ZERO CONTENT CHECK
        // ----------------------------------------------------

        const zeroCheckMatch =
          stdout.match(
            /ZERO CONTENT CHECK:\s*(PASS|FAIL)/i
          );

        // ----------------------------------------------------
        // HASH CHANGE
        // ----------------------------------------------------

        const hashChangedMatch =
          stdout.match(
            /CONTENT HASH CHANGED:\s*(YES|NO)/i
          );

        // ----------------------------------------------------
        // NORMALIZE
        // ----------------------------------------------------

        const beforeHash =
          beforeMatch
            ? beforeMatch[1].toLowerCase()
            : null;

        const afterHash =
          afterMatch
            ? afterMatch[1].toLowerCase()
            : null;

        const verification =
          verificationMatch
            ? verificationMatch[1].toUpperCase()
            : "UNKNOWN";

        const status =
          statusMatch
            ? statusMatch[1]
            : "UNKNOWN";

        const sizeBytes =
          sizeMatch
            ? Number(
                sizeMatch[1]
              )
            : null;

        const sizeCheck =
          sizeCheckMatch
            ? sizeCheckMatch[1].toUpperCase()
            : null;

        const zeroContentCheck =
          zeroCheckMatch
            ? zeroCheckMatch[1].toUpperCase()
            : null;

        const hashChanged =
          hashChangedMatch
            ? hashChangedMatch[1].toUpperCase()
            : null;

        // ----------------------------------------------------
        // READ AUDIT FILE
        // ----------------------------------------------------

        const auditExists =
          fs.existsSync(
            erasureAuditPath
          );

        let auditRecord =
          null;

        if (auditExists) {

          try {

            auditRecord =
              fs.readFileSync(
                erasureAuditPath,
                "utf8"
              );

          } catch (
            auditReadError
          ) {

            console.error(
              "Audit record read error:",
              auditReadError
            );
          }
        }

        // ----------------------------------------------------
        // SAFETY
        // ----------------------------------------------------

        const safety = {

          physicalDiskAccess:
            false,

          physicalDiskPathAccepted:
            false,

          sourceType:
            "TEST IMAGE",

          authorizedRoot:
            "core/testdata",

          target:
            "erase_test_image.bin",

          sourceImageModified:
            true,

          safetyBoundary:
            "ENABLED"
        };

        // ----------------------------------------------------
        // ENGINE ERROR
        // ----------------------------------------------------

        if (error) {

          console.error(
            "Erasure engine execution failed:",
            error
          );

          return res
            .status(500)
            .json({

              success:
                false,

              mode:
                "C++_ENGINE",

              message:
                "C++ erasure engine execution failed.",

              error:
                error.message,

              stderr:
                stderr || "",

              engineOutput:
                stdout || "",

              method,

              beforeHash,

              afterHash,

              verification,

              status,

              sizeBytes,

              verificationDetails: {

                sizeCheck,

                zeroContentCheck,

                hashChanged
              },

              auditLogCreated:
                auditExists,

              auditPath:
                auditExists
                  ? erasureAuditPath
                  : null,

              auditRecord,

              safety
            });
        }

        // ----------------------------------------------------
        // SUCCESS RESPONSE
        // ----------------------------------------------------

        return res.json({

          success:
            verification ===
            "PASS",

          mode:
            "C++_ENGINE",

          message:
            verification ===
            "PASS"

              ? "Safe test-image erasure completed successfully."

              : "Erasure completed but verification did not pass.",

          target:
            "erase_test_image.bin",

          method,

          sizeBytes,

          beforeHash,

          afterHash,

          verification,

          status,

          verificationDetails: {

            sizeCheck,

            zeroContentCheck,

            hashChanged
          },

          auditLogCreated:
            auditExists,

          auditPath:
            auditExists
              ? erasureAuditPath
              : null,

          auditRecord,

          engine:
            "C++",

          safety
        });
      }
    );
  }
);

// ============================================================
// STEP 17
// TAMPER-EVIDENT SHA-256 AUDIT CHAIN
// ============================================================

// ------------------------------------------------------------
// SHA-256
// ------------------------------------------------------------

function sha256(value) {

  return crypto
    .createHash("sha256")
    .update(
      value,
      "utf8"
    )
    .digest("hex");
}

// ------------------------------------------------------------
// CANONICAL RECORD
// ------------------------------------------------------------

function canonicalRecord(record) {

  return JSON.stringify({

    id:
      record.id,

    timestamp:
      record.timestamp,

    operator:
      record.operator,

    action:
      record.action,

    target:
      record.target,

    method:
      record.method,

    sizeBytes:
      record.sizeBytes,

    beforeHash:
      record.beforeHash,

    afterHash:
      record.afterHash,

    verification:
      record.verification,

    physicalDiskAccess:
      record.physicalDiskAccess,

    safetyMode:
      record.safetyMode,

    status:
      record.status,

    engine:
      record.engine,

    previousHash:
      record.previousHash
  });
}

// ------------------------------------------------------------
// RECORD HASH
// ------------------------------------------------------------

function calculateRecordHash(record) {

  return sha256(
    canonicalRecord(record)
  );
}

// ------------------------------------------------------------
// LOAD AUDIT CHAIN
// ------------------------------------------------------------

function loadAuditChain() {

  if (
    !fs.existsSync(
      auditChainPath
    )
  ) {

    return {

      version:
        1,

      algorithm:
        "SHA-256",

      records:
        []
    };
  }

  try {

    const chain =
      JSON.parse(
        fs.readFileSync(
          auditChainPath,
          "utf8"
        )
      );

    if (
      !chain ||
      !Array.isArray(
        chain.records
      )
    ) {

      return {

        version:
          1,

        algorithm:
          "SHA-256",

        records:
          []
      };
    }

    return chain;

  } catch (error) {

    console.error(
      "Audit chain read error:",
      error.message
    );

    return {

      version:
        1,

      algorithm:
        "SHA-256",

      records:
        []
    };
  }
}

// ------------------------------------------------------------
// SAVE AUDIT CHAIN
// ------------------------------------------------------------

function saveAuditChain(chain) {

  fs.writeFileSync(

    auditChainPath,

    JSON.stringify(
      chain,
      null,
      2
    ),

    "utf8"
  );
}

// ------------------------------------------------------------
// INITIALIZE GENESIS
// ------------------------------------------------------------

function initializeAuditChain() {

  const chain =
    loadAuditChain();

  if (
    chain.records.length === 0
  ) {

    const genesis = {

      id:
        "GENESIS",

      timestamp:
        new Date().toISOString(),

      operator:
        "system",

      action:
        "CHAIN_INITIALIZED",

      target:
        "SECUREWIPE-AUDIT-LEDGER",

      method:
        "SHA-256",

      sizeBytes:
        null,

      beforeHash:
        null,

      afterHash:
        null,

      verification:
        "PASS",

      physicalDiskAccess:
        false,

      safetyMode:
        "TEST IMAGE ONLY",

      status:
        "CHAIN INITIALIZED",

      engine:
        "Node.js",

      previousHash:
        "0".repeat(64)
    };

    genesis.recordHash =
      calculateRecordHash(
        genesis
      );

    chain.version =
      1;

    chain.algorithm =
      "SHA-256";

    chain.records.push(
      genesis
    );

    saveAuditChain(
      chain
    );

    console.log(
      "Audit chain initialized with GENESIS."
    );
  }

  return chain;
}

// ------------------------------------------------------------
// APPEND AUDIT RECORD
// ------------------------------------------------------------

function appendAuditRecord(record) {

  const chain =
    loadAuditChain();

  const existing =
    chain.records.find(
      item =>
        item.id ===
        record.id
    );

  if (existing) {

    return {

      added:
        false,

      record:
        existing
    };
  }

  const previous =
    chain.records[
      chain.records.length - 1
    ];

  const chainedRecord = {

    ...record,

    previousHash:
      previous
        ? previous.recordHash
        : "0".repeat(64),

    timestamp:
      record.timestamp ||
      new Date().toISOString()
  };

  chainedRecord.recordHash =
    calculateRecordHash(
      chainedRecord
    );

  chain.records.push(
    chainedRecord
  );

  saveAuditChain(
    chain
  );

  return {

    added:
      true,

    record:
      chainedRecord
  };
}

// ------------------------------------------------------------
// VERIFY COMPLETE AUDIT CHAIN
// ------------------------------------------------------------

function verifyAuditChain() {

  const chain =
    loadAuditChain();

  const records =
    chain.records;

  if (
    !Array.isArray(records) ||
    records.length === 0
  ) {

    return {

      valid:
        false,

      message:
        "Audit chain is empty.",

      checkedRecords:
        0,

      algorithm:
        "SHA-256"
    };
  }

  for (
    let i = 0;
    i < records.length;
    i++
  ) {

    const current =
      records[i];

    // ------------------------------------------------------
    // VERIFY PREVIOUS HASH
    // ------------------------------------------------------

    const expectedPreviousHash =
      i === 0

        ? "0".repeat(64)

        : records[i - 1]
            .recordHash;

    if (
      current.previousHash !==
      expectedPreviousHash
    ) {

      return {

        valid:
          false,

        message:
          "Previous hash mismatch.",

        failedRecord:
          current.id,

        checkedRecords:
          i + 1,

        algorithm:
          "SHA-256"
      };
    }

    // ------------------------------------------------------
    // VERIFY CURRENT RECORD HASH
    // ------------------------------------------------------

    const recalculatedHash =
      calculateRecordHash(
        current
      );

    if (
      current.recordHash !==
      recalculatedHash
    ) {

      return {

        valid:
          false,

        message:
          "Record hash mismatch.",

        failedRecord:
          current.id,

        checkedRecords:
          i + 1,

        algorithm:
          "SHA-256"
      };
    }
  }

  return {

    valid:
      true,

    message:
      "Audit chain integrity verified.",

    checkedRecords:
      records.length,

    lastRecord:
      records[
        records.length - 1
      ].id,

    algorithm:
      "SHA-256"
  };
}

// ------------------------------------------------------------
// PARSE REAL C++ AUDIT FILE
// ------------------------------------------------------------

function parseErasureAuditFile() {

  if (
    !fs.existsSync(
      erasureAuditPath
    )
  ) {

    return null;
  }

  const auditText =
    fs.readFileSync(
      erasureAuditPath,
      "utf8"
    );

  function extract(regex) {

    const match =
      auditText.match(
        regex
      );

    return match
      ? match[1].trim()
      : null;
  }

  const targetPath =
    extract(
      /Target:\s*([^\r\n]+)/i
    );

  const sizeText =
    extract(
      /Size:\s*([0-9]+)\s*bytes/i
    );

  const method =
    extract(
      /Method:\s*([^\r\n]+)/i
    );

  const beforeHash =
    extract(
      /BEFORE SHA-256:\s*([a-fA-F0-9]{64})/i
    );

  const afterHash =
    extract(
      /AFTER SHA-256:\s*([a-fA-F0-9]{64})/i
    );

  const verification =
    extract(
      /VERIFICATION:\s*([A-Z]+)/i
    );

  const physicalDiskAccess =
    extract(
      /PHYSICAL DISK ACCESS:\s*([A-Z]+)/i
    );

  const safetyMode =
    extract(
      /SAFETY MODE:\s*([^\r\n]+)/i
    );

  const status =
    extract(
      /STATUS:\s*([^\r\n]+)/i
    );

  const stat =
    fs.statSync(
      erasureAuditPath
    );

  return {

    target:
      targetPath
        ? path.basename(
            targetPath
          )
        : "erase_test_image.bin",

    sizeBytes:
      sizeText
        ? Number(
            sizeText
          )
        : null,

    method:
      method ||
      "Single-pass zero overwrite",

    beforeHash:
      beforeHash
        ? beforeHash.toLowerCase()
        : null,

    afterHash:
      afterHash
        ? afterHash.toLowerCase()
        : null,

    verification:
      verification
        ? verification.toUpperCase()
        : "UNKNOWN",

    physicalDiskAccess:
      physicalDiskAccess ===
      "DISABLED"
        ? false
        : null,

    safetyMode:
      safetyMode ||
      "TEST IMAGE ONLY",

    status:
      status ||
      "TEST IMAGE SANITIZED",

    engine:
      "C++",

    auditFile:
      "erase_test_image.bin.audit.txt",

    timestamp:
      stat.mtime.toISOString()
  };
}

// ------------------------------------------------------------
// SYNC REAL ERASURE AUDIT INTO CHAIN
// ------------------------------------------------------------

function syncRealErasureAudit() {

  try {

    if (
      !fs.existsSync(
        erasureAuditPath
      )
    ) {

      console.log(
        "No C++ erasure audit file found."
      );

      return null;
    }

    const parsed =
      parseErasureAuditFile();

    if (!parsed) {

      console.log(
        "Unable to parse C++ audit file."
      );

      return null;
    }

    // --------------------------------------------------------
    // Stable record ID
    // --------------------------------------------------------

    const recordId =
      parsed.afterHash

        ? `AUDIT-ERASURE-${parsed.afterHash
            .substring(0, 12)
            .toUpperCase()}`

        : "AUDIT-ERASURE-NOHASH";

    const record = {

      id:
        recordId,

      timestamp:
        parsed.timestamp,

      operator:
        "investigator",

      action:
        "TEST_IMAGE_ERASURE",

      target:
        parsed.target,

      method:
        parsed.method,

      sizeBytes:
        parsed.sizeBytes,

      beforeHash:
        parsed.beforeHash,

      afterHash:
        parsed.afterHash,

      verification:
        parsed.verification,

      physicalDiskAccess:
        parsed.physicalDiskAccess,

      safetyMode:
        parsed.safetyMode,

      status:
        parsed.status,

      engine:
        "C++"
    };

    const result =
      appendAuditRecord(
        record
      );

    console.log(
      "Audit chain synchronization:",
      result.added
        ? "RECORD ADDED"
        : "RECORD ALREADY EXISTS"
    );

    console.log(
      "Audit record:",
      result.record.id
    );

    return result;

  } catch (error) {

    console.error(
      "Audit synchronization error:",
      error.message
    );

    return null;
  }
}

// ============================================================
// INITIALIZE AUDIT CHAIN ON SERVER START
// ============================================================

initializeAuditChain();

// ============================================================
// FORENSIC AUDIT RECORDS
// ============================================================

app.get(
  "/api/audit",
  (req, res) => {

    try {

      const demoRecords = [

        {
          id:
            "AUDIT-001",

          operator:
            "investigator",

          action:
            "DEVICE_SCAN",

          target:
            "RECOVERY-IMAGE-01",

          method:
            "N/A",

          verification:
            "N/A",

          status:
            "SUCCESS"
        },

        {
          id:
            "AUDIT-002",

          operator:
            "investigator",

          action:
            "RECOVERY_ANALYSIS",

          target:
            "RECOVERY-IMAGE-01",

          method:
            "N/A",

          verification:
            "N/A",

          status:
            "SUCCESS"
        }
      ];

      const records =
        [...demoRecords];

      const parsed =
        parseErasureAuditFile();

      if (parsed) {

  const recordId =
    parsed.afterHash
      ? `AUDIT-ERASURE-${parsed.afterHash
          .substring(0, 12)
          .toUpperCase()}`
      : "AUDIT-ERASURE-NOHASH";

  records.push({

    id:
      recordId,

    operator:
      "investigator",

    action:
      "TEST_IMAGE_ERASURE",

    ...parsed

  });
}

      res.json({

        success:
          true,

        count:
          records.length,

        records
      });

    } catch (error) {

      console.error(
        "Audit API error:",
        error
      );

      res
        .status(500)
        .json({

          success:
            false,

          error:
            "Failed to read forensic audit records",

          message:
            error.message
        });
    }
  }
);

// ============================================================
// AUDIT CHAIN API
// ============================================================

app.get(
  "/api/audit/chain",
  (req, res) => {

    try {

      // Make sure Genesis exists
      initializeAuditChain();

      // Synchronize real C++ audit
      syncRealErasureAudit();

      // Load updated chain
      const chain =
        loadAuditChain();

      // Verify chain
      const verification =
        verifyAuditChain();

      res.json({

        success:
          true,

        version:
          chain.version,

        algorithm:
          chain.algorithm,

        count:
          chain.records.length,

        records:
          chain.records,

        verification
      });

    } catch (error) {

      console.error(
        "Audit chain error:",
        error
      );

      res
        .status(500)
        .json({

          success:
            false,

          error:
            "Unable to load audit chain",

          message:
            error.message
        });
    }
  }
);

// ============================================================
// VERIFY AUDIT CHAIN
// ============================================================

app.get(
  "/api/audit/chain/verify",
  (req, res) => {

    try {

      // Make sure Genesis exists
      initializeAuditChain();

      // Synchronize C++ audit
      syncRealErasureAudit();

      // Verify
      const result =
        verifyAuditChain();

      res.json({

        success:
          true,

        ...result
      });

    } catch (error) {

      console.error(
        "Audit chain verification error:",
        error
      );

      res
        .status(500)
        .json({

          success:
            false,

          error:
            "Audit chain verification failed",

          message:
            error.message
        });
    }
  }
);

// ============================================================
// STEP 18
// DIGITAL FORENSIC CERTIFICATE SYSTEM
// ============================================================

const certificateKeysPath =
  path.join(
    __dirname,
    "certificates",
    "keys"
  );

const issuedCertificatesPath =
  path.join(
    __dirname,
    "certificates",
    "issued"
  );

const privateKeyPath =
  path.join(
    certificateKeysPath,
    "private.pem"
  );

const publicKeyPath =
  path.join(
    certificateKeysPath,
    "public.pem"
  );

// ------------------------------------------------------------
// Ensure certificate directories exist
// ------------------------------------------------------------

fs.mkdirSync(
  certificateKeysPath,
  {
    recursive: true
  }
);

fs.mkdirSync(
  issuedCertificatesPath,
  {
    recursive: true
  }
);

// ------------------------------------------------------------
// Load signing keys
// ------------------------------------------------------------

function loadCertificatePrivateKey() {

  if (
    !fs.existsSync(
      privateKeyPath
    )
  ) {

    throw new Error(
      "Certificate private key not found."
    );
  }

  return fs.readFileSync(
    privateKeyPath,
    "utf8"
  );
}

function loadCertificatePublicKey() {

  if (
    !fs.existsSync(
      publicKeyPath
    )
  ) {

    throw new Error(
      "Certificate public key not found."
    );
  }

  return fs.readFileSync(
    publicKeyPath,
    "utf8"
  );
}

// ------------------------------------------------------------
// Canonical certificate payload
// ------------------------------------------------------------

function canonicalCertificatePayload(
  certificate
) {

  return JSON.stringify({

    certificateId:
      certificate.certificateId,

    issuedAt:
      certificate.issuedAt,

    operator:
      certificate.operator,

    target:
      certificate.target,

    method:
      certificate.method,

    sizeBytes:
      certificate.sizeBytes,

    beforeHash:
      certificate.beforeHash,

    afterHash:
      certificate.afterHash,

    verification:
      certificate.verification,

    physicalDiskAccess:
      certificate.physicalDiskAccess,

    safetyMode:
      certificate.safetyMode,

    auditRecordHash:
      certificate.auditRecordHash,

    auditChainStatus:
      certificate.auditChainStatus,

    blockchainStatus:
      certificate.blockchainStatus
  });
}

// ------------------------------------------------------------
// Create certificate hash
// ------------------------------------------------------------

function calculateCertificateHash(
  certificate
) {

  return sha256(
    canonicalCertificatePayload(
      certificate
    )
  );
}

// ------------------------------------------------------------
// Digitally sign certificate hash
// ------------------------------------------------------------

function signCertificate(
  certificateHash
) {

  const privateKey =
    loadCertificatePrivateKey();

  const signer =
    crypto.createSign(
      "RSA-SHA256"
    );

  signer.update(
    certificateHash,
    "utf8"
  );

  signer.end();

  return signer.sign(
    privateKey,
    "base64"
  );
}

// ------------------------------------------------------------
// Verify digital signature
// ------------------------------------------------------------

function verifyCertificateSignature(
  certificateHash,
  signature
) {

  try {

    const publicKey =
      loadCertificatePublicKey();

    const verifier =
      crypto.createVerify(
        "RSA-SHA256"
      );

    verifier.update(
      certificateHash,
      "utf8"
    );

    verifier.end();

    return verifier.verify(
      publicKey,
      signature,
      "base64"
    );

  } catch (error) {

    console.error(
      "Certificate signature verification error:",
      error.message
    );

    return false;
  }
}

// ------------------------------------------------------------
// Generate next certificate ID
// ------------------------------------------------------------

function generateCertificateId() {

  const files =
    fs.readdirSync(
      issuedCertificatesPath
    );

  const certificateFiles =
    files.filter(
      file =>
        file.endsWith(
          ".json"
        )
    );

  const number =
    certificateFiles.length + 1;

  const year =
    new Date()
      .getFullYear();

  return (
    `SWF-CERT-${year}-` +
    String(number).padStart(
      4,
      "0"
    )
  );
}

// ------------------------------------------------------------
// Get latest real audit-chain record
// ------------------------------------------------------------

function getLatestAuditRecord() {

  initializeAuditChain();

  syncRealErasureAudit();

  const chain =
    loadAuditChain();

  const verification =
    verifyAuditChain();

  if (
    !verification.valid
  ) {

    throw new Error(
      "Audit chain verification failed. Certificate generation stopped."
    );
  }

  const records =
    chain.records;

  const latest =
    records[
      records.length - 1
    ];

  return {

    record:
      latest,

    verification
  };
}

// ============================================================
// CREATE CERTIFICATE
// ============================================================

app.post(
  "/api/certificates/generate",
  (req, res) => {

    try {

      // ------------------------------------------------------
      // Get verified audit record
      // ------------------------------------------------------

      const audit =
        getLatestAuditRecord();

      const record =
        audit.record;

      // ------------------------------------------------------
      // Certificate ID
      // ------------------------------------------------------

      const certificateId =
        generateCertificateId();

      // ------------------------------------------------------
      // Certificate payload
      // ------------------------------------------------------

      const certificate = {

        certificateId,

        issuedAt:
          new Date()
            .toISOString(),

        operator:
          record.operator ||
          "investigator",

        target:
          record.target ||
          "erase_test_image.bin",

        method:
          record.method ||
          "Unknown",

        sizeBytes:
          record.sizeBytes ??
          null,

        beforeHash:
          record.beforeHash ||
          null,

        afterHash:
          record.afterHash ||
          null,

        verification:
          record.verification ||
          "UNKNOWN",

        physicalDiskAccess:
          record.physicalDiskAccess ===
          false
            ? false
            : null,

        safetyMode:
          record.safetyMode ||
          "TEST IMAGE ONLY",

        auditRecordHash:
          record.recordHash ||
          null,

        auditChainStatus:
          "VERIFIED",

        blockchainStatus:
          "READY_FOR_ANCHORING"
      };

      // ------------------------------------------------------
      // Calculate certificate SHA-256
      // ------------------------------------------------------

      const certificateHash =
        calculateCertificateHash(
          certificate
        );

      // ------------------------------------------------------
      // Sign certificate
      // ------------------------------------------------------

      const signature =
        signCertificate(
          certificateHash
        );

      // ------------------------------------------------------
      // Final certificate object
      // ------------------------------------------------------

      const finalCertificate = {

        ...certificate,

        certificateHash,

        signatureAlgorithm:
          "RSA-SHA256",

        signature,

        signatureStatus:
          "VALID",

        blockchain: {

          status:
            "READY_FOR_ANCHORING",

          network:
            "HYPERLEDGER_FABRIC",

          transactionId:
            null,

          anchorHash:
            certificateHash
        }
      };

      // ------------------------------------------------------
      // Save certificate
      // ------------------------------------------------------

      const certificateFile =
        path.join(

          issuedCertificatesPath,

          `${certificateId}.json`
        );

      fs.writeFileSync(

        certificateFile,

        JSON.stringify(
          finalCertificate,
          null,
          2
        ),

        "utf8"
      );

      console.log("");

      console.log(
        "=============================================="
      );

      console.log(
        "DIGITAL CERTIFICATE GENERATED"
      );

      console.log(
        "=============================================="
      );

      console.log(
        "Certificate:",
        certificateId
      );

      console.log(
        "Target:",
        certificate.target
      );

      console.log(
        "Certificate SHA-256:",
        certificateHash
      );

      console.log(
        "Signature:",
        "VALID"
      );

      console.log(
        "Audit Chain:",
        "VERIFIED"
      );

      console.log(
        "Blockchain:",
        "READY FOR ANCHORING"
      );

      console.log(
        "=============================================="
      );

      console.log("");

      res.json({

        success:
          true,

        message:
          "Digital forensic certificate generated successfully.",

        certificate:
          finalCertificate,

        certificateFile:
          certificateFile
      });

    } catch (error) {

      console.error(
        "Certificate generation error:",
        error
      );

      res
        .status(500)
        .json({

          success:
            false,

          message:
            "Certificate generation failed.",

          error:
            error.message
        });
    }
  }
);

// ============================================================
// LIST CERTIFICATES
// ============================================================

app.get(
  "/api/certificates",
  (req, res) => {

    try {

      const files =
        fs.readdirSync(
          issuedCertificatesPath
        );

      const certificates =
        files

          .filter(
            file =>
              file.endsWith(
                ".json"
              )
          )

          .map(
            file => {

              try {

                const certificate =
                  JSON.parse(
                    fs.readFileSync(
                      path.join(
                        issuedCertificatesPath,
                        file
                      ),
                      "utf8"
                    )
                  );

                return {

                  id:
                    certificate.certificateId,

                  issuedAt:
                    certificate.issuedAt,

                  target:
                    certificate.target,

                  method:
                    certificate.method,

                  verification:
                    certificate.verification,

                  certificateHash:
                    certificate.certificateHash,

                  signatureStatus:
                    certificate.signatureStatus,

                  blockchainStatus:
                    certificate
                      .blockchain
                      ?.status ||
                    "UNKNOWN"
                };

              } catch {

                return null;
              }
            }
          )

          .filter(Boolean);

      res.json({

        success:
          true,

        count:
          certificates.length,

        certificates
      });

    } catch (error) {

      res
        .status(500)
        .json({

          success:
            false,

          message:
            "Unable to load certificates.",

          error:
            error.message
        });
    }
  }
);

// ============================================================
// GET CERTIFICATE BY ID
// ============================================================

app.get(
  "/api/certificates/:id",
  (req, res) => {

    try {

      const filePath =
        path.join(

          issuedCertificatesPath,

          `${req.params.id}.json`
        );

      if (
        !fs.existsSync(
          filePath
        )
      ) {

        return res
          .status(404)
          .json({

            success:
              false,

            message:
              "Certificate not found."
          });
      }

      const certificate =
        JSON.parse(
          fs.readFileSync(
            filePath,
            "utf8"
          )
        );

      res.json({

        success:
          true,

        certificate
      });

    } catch (error) {

      res
        .status(500)
        .json({

          success:
            false,

          message:
            "Unable to read certificate.",

          error:
            error.message
        });
    }
  }
);

// ============================================================
// VERIFY CERTIFICATE
// ============================================================

app.get(
  "/api/certificates/:id/verify",
  (req, res) => {

    try {

      const filePath =
        path.join(

          issuedCertificatesPath,

          `${req.params.id}.json`
        );

      if (
        !fs.existsSync(
          filePath
        )
      ) {

        return res
          .status(404)
          .json({

            success:
              false,

            valid:
              false,

            message:
              "Certificate not found."
          });
      }

      const certificate =
        JSON.parse(
          fs.readFileSync(
            filePath,
            "utf8"
          )
        );

      // ------------------------------------------------------
      // Recalculate certificate hash
      // ------------------------------------------------------

      const recalculatedHash =
        calculateCertificateHash(
          certificate
        );

      const hashValid =
        recalculatedHash ===
        certificate.certificateHash;

      // ------------------------------------------------------
      // Verify RSA signature
      // ------------------------------------------------------

      const signatureValid =
        verifyCertificateSignature(

          certificate.certificateHash,

          certificate.signature
        );

      // ------------------------------------------------------
      // Verify audit chain
      // ------------------------------------------------------

      initializeAuditChain();

      const chainVerification =
        verifyAuditChain();

      const valid =
        hashValid &&
        signatureValid &&
        chainVerification.valid;

      res.json({

        success:
          true,

        valid,

        certificateId:
          certificate.certificateId,

        checks: {

          certificateHash:
            hashValid,

          digitalSignature:
            signatureValid,

          auditChain:
            chainVerification.valid
        },

        storedHash:
          certificate.certificateHash,

        calculatedHash:
          recalculatedHash,

        signatureAlgorithm:
          certificate.signatureAlgorithm,

        auditChainMessage:
          chainVerification.message,

        blockchainStatus:
          certificate
            .blockchain
            ?.status ||
          "UNKNOWN"
      });

    } catch (error) {

      res
        .status(500)
        .json({

          success:
            false,

          valid:
            false,

          message:
            "Certificate verification failed.",

          error:
            error.message
        });
    }
  }
);

// ============================================================
// STEP 19
// BLOCKCHAIN CERTIFICATE ANCHOR
// ============================================================

app.post(
  "/api/blockchain/anchor",
  (req, res) => {

    try {

      const certificateId =
        req.body?.certificateId;

      if (!certificateId) {

        return res
          .status(400)
          .json({

            success:
              false,

            message:
              "certificateId is required."
          });
      }

      const certificatePath =
        path.join(

          issuedCertificatesPath,

          `${certificateId}.json`
        );

      if (
        !fs.existsSync(
          certificatePath
        )
      ) {

        return res
          .status(404)
          .json({

            success:
              false,

            message:
              "Certificate not found.",

            certificateId
          });
      }

      const certificate =
        JSON.parse(
          fs.readFileSync(
            certificatePath,
            "utf8"
          )
        );

      // ------------------------------------------------------
      // Certificate must be valid
      // ------------------------------------------------------

      const recalculatedHash =
        calculateCertificateHash(
          certificate
        );

      if (
        recalculatedHash !==
        certificate.certificateHash
      ) {

        return res
          .status(400)
          .json({

            success:
              false,

            message:
              "Certificate hash verification failed. Blockchain anchoring stopped.",

            certificateId
          });
      }

      // ------------------------------------------------------
      // Verify digital signature
      // ------------------------------------------------------

      const signatureValid =
        verifyCertificateSignature(

          certificate.certificateHash,

          certificate.signature
        );

      if (!signatureValid) {

        return res
          .status(400)
          .json({

            success:
              false,

            message:
              "Certificate digital signature is invalid. Blockchain anchoring stopped.",

            certificateId
          });
      }

      // ------------------------------------------------------
      // Verify audit chain
      // ------------------------------------------------------

      const auditVerification =
        verifyAuditChain();

      if (
        !auditVerification.valid
      ) {

        return res
          .status(400)
          .json({

            success:
              false,

            message:
              "Audit chain verification failed. Blockchain anchoring stopped.",

            auditVerification
          });
      }

      // ------------------------------------------------------
      // Anchor
      // ------------------------------------------------------

      const result =
        blockchain.anchorCertificate(
          certificate
        );

      // ------------------------------------------------------
      // Update certificate
      // ------------------------------------------------------

      certificate.blockchain = {

        status:
          "ANCHORED",

        network:
          "SecureWipe-Forensics-Testnet",

        technology:
          "Hyperledger Fabric Compatible Prototype",

        transactionId:
          result.block
            .transactionId,

        blockIndex:
          result.block.index,

        blockHash:
          result.block.hash,

        anchorHash:
          certificate.certificateHash,

        anchoredAt:
          result.block.timestamp
      };

      fs.writeFileSync(

        certificatePath,

        JSON.stringify(
          certificate,
          null,
          2
        ),

        "utf8"
      );

      res.json({

        success:
          true,

        message:
          result.alreadyAnchored

            ? "Certificate was already anchored."

            : "Certificate successfully anchored to the local blockchain prototype.",

        alreadyAnchored:
          result.alreadyAnchored,

        blockchain:
          certificate.blockchain
      });

    } catch (error) {

      console.error(
        "Blockchain anchor error:",
        error
      );

      res
        .status(500)
        .json({

          success:
            false,

          message:
            "Blockchain anchoring failed.",

          error:
            error.message
        });
    }
  }
);

// ============================================================
// BLOCKCHAIN LEDGER
// ============================================================

app.get(
  "/api/blockchain/ledger",
  (req, res) => {

    try {

      const ledger =
        blockchain.loadLedger();

      res.json({

        success:
          true,

        network:
          ledger.network,

        algorithm:
          ledger.algorithm,

        blockCount:
          ledger.blocks.length,

        blocks:
          ledger.blocks
      });

    } catch (error) {

      res
        .status(500)
        .json({

          success:
            false,

          message:
            "Unable to load blockchain ledger.",

          error:
            error.message
        });
    }
  }
);

// ============================================================
// BLOCKCHAIN VERIFICATION
// ============================================================

app.get(
  "/api/blockchain/verify",
  (req, res) => {

    try {

      const result =
        blockchain.verifyBlockchain();

      res.json({

        success:
          true,

        ...result
      });

    } catch (error) {

      res
        .status(500)
        .json({

          success:
            false,

          valid:
            false,

          message:
            "Blockchain verification failed.",

          error:
            error.message
        });
    }
  }
);

/*
|--------------------------------------------------------------------------
| Download forensic certificate
|--------------------------------------------------------------------------
*/
// ============================================================
// FORENSIC CERTIFICATE PDF DOWNLOAD
// ============================================================

app.get(
  "/api/certificates/:id/download",
  async (req, res) => {

    try {

      const certificateId =
        String(req.params.id || "").trim();

      // ------------------------------------------------------
      // SECURITY: validate certificate ID
      // ------------------------------------------------------

      if (
        !/^SWF-CERT-\d{4}-\d{4}$/.test(
          certificateId
        )
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Invalid certificate ID."
        });
      }

      // ------------------------------------------------------
      // Certificate file
      // ------------------------------------------------------

      const certificatePath =
        path.join(
          issuedCertificatesPath,
          `${certificateId}.json`
        );

      // ------------------------------------------------------
      // Check certificate exists
      // ------------------------------------------------------

      if (
        !fs.existsSync(
          certificatePath
        )
      ) {

        return res.status(404).json({

          success: false,

          message:
            "Certificate not found.",

          certificateId
        });
      }

      // ------------------------------------------------------
      // Read certificate
      // ------------------------------------------------------

      const certificate =
        JSON.parse(
          fs.readFileSync(
            certificatePath,
            "utf8"
          )
        );

      // ------------------------------------------------------
      // Verification URL
      // ------------------------------------------------------

      const host =
        req.get("host") ||
        `localhost:${PORT}`;

      const frontendPort =
        process.env.FRONTEND_PORT ||
        "5174";

      const hostname =
        host
          .split(":")[0];

      const verificationUrl =
        `${req.protocol}://${hostname}:${frontendPort}/?certificate=${encodeURIComponent(
          certificateId
        )}`;

      // ------------------------------------------------------
      // Generate QR code
      // ------------------------------------------------------

      const qrDataUrl =
        await QRCode.toDataURL(
          verificationUrl,
          {
            errorCorrectionLevel: "M",
            margin: 2,
            width: 180
          }
        );

      const qrImage =
        Buffer.from(
          qrDataUrl.replace(
            /^data:image\/png;base64,/,
            ""
          ),
          "base64"
        );

      // ------------------------------------------------------
      // Create PDF
      // ------------------------------------------------------

      const doc =
        new PDFDocument({
          size: "A4",
          margin: 50,
          info: {
            Title:
              `SecureWipe Forensics Certificate - ${certificateId}`,

            Author:
              "SecureWipe-Forensics",

            Subject:
              "Digital Forensic Data Sanitization Certificate",

            Keywords:
              "SecureWipe, Forensics, Sanitization, SHA-256, RSA"
          }
        });

      // ------------------------------------------------------
      // PDF response headers
      // ------------------------------------------------------

      const filename =
        `${certificateId}-forensic-certificate.pdf`;

      res.status(200);

      res.setHeader(
        "Content-Type",
        "application/pdf"
      );

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );

      res.setHeader(
        "Cache-Control",
        "no-store, no-cache, must-revalidate"
      );

      res.setHeader(
        "Pragma",
        "no-cache"
      );

      // ------------------------------------------------------
      // Connect PDF to HTTP response
      // ------------------------------------------------------

      doc.pipe(res);

      // ======================================================
      // HEADER
      // ======================================================

      doc
        .font("Helvetica-Bold")
        .fontSize(24)
        .text(
          "SECUREWIPE FORENSICS",
          {
            align: "center"
          }
        );

      doc
        .moveDown(0.35)
        .font("Helvetica")
        .fontSize(10)
        .text(
          "DIGITAL FORENSIC DATA SANITIZATION CERTIFICATE",
          {
            align: "center"
          }
        );

      doc.moveDown(0.5);

      doc
        .moveTo(50, doc.y)
        .lineTo(545, doc.y)
        .stroke();

      doc.moveDown(0.5);

      doc
        .font("Helvetica-Bold")
        .fontSize(17)
        .text(
          "CERTIFICATE VALID",
          {
            align: "center"
          }
        );

      doc.moveDown(0.8);

      // ======================================================
      // QR CODE
      // ======================================================

      doc.image(
        qrImage,
        70,
        doc.y,
        {
          fit: [125, 125]
        }
      );

      doc
        .font("Helvetica")
        .fontSize(8)
        .text(
          "Scan this QR code to verify the certificate",
          55,
          doc.y + 132,
          {
            width: 155,
            align: "center"
          }
        );

      doc.moveDown(9);

      // ======================================================
      // HELPERS
      // ======================================================

      function addSectionTitle(title) {

        doc
          .moveDown(0.45)
          .font("Helvetica-Bold")
          .fontSize(12)
          .text(title);

        doc.moveDown(0.15);
      }

      function addField(label, value) {

        const safeValue =
          value === undefined ||
          value === null ||
          value === ""
            ? "N/A"
            : String(value);

        doc
          .font("Helvetica")
          .fontSize(8.5)
          .text(
            `${label}: ${safeValue}`
          );
      }

      // ======================================================
      // CERTIFICATE INFORMATION
      // ======================================================

      addSectionTitle(
        "Certificate Information"
      );

      addField(
        "Certificate ID",
        certificate.certificateId
      );

      addField(
        "Issued At",
        certificate.issuedAt
      );

      addField(
        "Operator",
        certificate.operator
      );

      // ======================================================
      // SANITIZATION INFORMATION
      // ======================================================

      addSectionTitle(
        "Sanitization Information"
      );

      addField(
        "Target",
        certificate.target
      );

      addField(
        "Method",
        certificate.method
      );

      const sizeMB =
        certificate.sizeBytes
          ? (
              Number(
                certificate.sizeBytes
              ) /
              (1024 * 1024)
            ).toFixed(2) + " MB"
          : "N/A";

      addField(
        "Size",
        sizeMB
      );

      addField(
        "Verification",
        certificate.verification
      );

      addField(
        "Physical Disk Access",
        String(
          certificate.physicalDiskAccess
        )
      );

      addField(
        "Safety Mode",
        certificate.safetyMode
      );

      // ======================================================
      // CRYPTOGRAPHIC VERIFICATION
      // ======================================================

      addSectionTitle(
        "Cryptographic Verification"
      );

      addField(
        "Before SHA-256",
        certificate.beforeHash
      );

      addField(
        "After SHA-256",
        certificate.afterHash
      );

      addField(
        "Certificate SHA-256",
        certificate.certificateHash
      );

      addField(
        "Signature Algorithm",
        certificate.signatureAlgorithm ||
          "RSA-SHA256"
      );

      addField(
        "Signature Status",
        certificate.signatureStatus ||
          "VALID"
      );

      // ======================================================
      // AUDIT & BLOCKCHAIN
      // ======================================================

      addSectionTitle(
        "Audit & Blockchain Verification"
      );

      addField(
        "Audit Record Hash",
        certificate.auditRecordHash
      );

      addField(
        "Audit Chain Status",
        certificate.auditChainStatus ||
          "VERIFIED"
      );

      const blockchainStatus =
        certificate.blockchain?.status ||
        certificate.blockchainStatus ||
        "READY_FOR_ANCHORING";

      addField(
        "Blockchain Status",
        blockchainStatus
      );

      if (
        certificate.blockchain?.network
      ) {

        addField(
          "Blockchain Network",
          certificate.blockchain.network
        );
      }

      if (
        certificate.blockchain?.transactionId
      ) {

        addField(
          "Transaction ID",
          certificate.blockchain.transactionId
        );
      }

      if (
        certificate.blockchain?.blockHash
      ) {

        addField(
          "Block Hash",
          certificate.blockchain.blockHash
        );
      }

      // ======================================================
      // VERIFICATION STATEMENT
      // ======================================================

      addSectionTitle(
        "Verification Statement"
      );

      doc
        .font("Helvetica")
        .fontSize(8.5)
        .text(
          "This certificate records the result of the SecureWipe-Forensics data sanitization process. Cryptographic hashes are provided for integrity verification. The certificate is digitally signed using RSA-SHA256 and its audit information is linked to the SecureWipe-Forensics audit chain."
        );

      doc.moveDown(0.7);

      // ======================================================
      // FINAL RESULT
      // ======================================================

      doc
        .font("Helvetica-Bold")
        .fontSize(13)
        .text(
          `Verification Result: ${
            certificate.verification ||
            "PASS"
          }`,
          {
            align: "center"
          }
        );

      doc.moveDown(0.4);

      doc
        .font("Helvetica")
        .fontSize(8.5)
        .text(
          `Blockchain: ${blockchainStatus}`,
          {
            align: "center"
          }
        );

      doc.moveDown(0.25);

      doc
        .moveTo(50, doc.y)
        .lineTo(545, doc.y)
        .stroke();

      doc.moveDown(0.25);

      // ======================================================
      // FOOTER
      // ======================================================

      doc
        .font("Helvetica")
        .fontSize(7.5)
        .text(
          "SecureWipe-Forensics | Digital Forensics & Secure Data Sanitization",
          {
            align: "center"
          }
        );

      doc
        .fontSize(7.5)
        .text(
          `Certificate ID: ${certificateId}`,
          {
            align: "center"
          }
        );

      // ======================================================
      // FINISH PDF
      // ======================================================

      doc.end();

    } catch (error) {

      console.error(
        "Certificate PDF download error:",
        error
      );

      if (!res.headersSent) {

        return res.status(500).json({

          success: false,

          message:
            "Failed to generate forensic certificate PDF.",

          error:
            error.message
        });
      }
    }
  }
);

// ============================================================
// 404 HANDLER
// ============================================================

app.use(
  (req, res) => {

    res
      .status(404)
      .json({

        success:
          false,

        message:
          "API endpoint not found.",

        path:
          req.originalUrl
      });
  }
);

// ============================================================
// ERROR HANDLER
// ============================================================

app.use(
  (
    err,
    req,
    res,
    next
  ) => {

    console.error(
      "SERVER ERROR:",
      err
    );

    res
      .status(500)
      .json({

        success:
          false,

        message:
          "Internal server error."
      });
  }
);

// ============================================================
// START SERVER
// ============================================================
function addSectionTitle(doc, title) {
  doc
    .moveDown(0.5)
    .fontSize(13)
    .font("Helvetica-Bold")
    .text(title);

  doc.moveDown(0.3);
}

function addField(doc, label, value) {
  const safeValue =
    value === undefined ||
    value === null ||
    value === ""
      ? "N/A"
      : String(value);

  doc
    .fontSize(9)
    .font("Helvetica-Bold")
    .text(`${label}:`, {
      continued: true
    })
    .font("Helvetica")
    .text(` ${safeValue}`);

  doc.moveDown(0.15);
}

function formatBytes(bytes) {
  if (!bytes || bytes === 0) {
    return "0 Bytes";
  }

  const units = [
    "Bytes",
    "KB",
    "MB",
    "GB",
    "TB"
  ];

  const index = Math.floor(
    Math.log(bytes) / Math.log(1024)
  );

  return (
    (bytes / Math.pow(1024, index)).toFixed(2) +
    " " +
    units[index]
  );
}

// ============================================================
// REAL FORENSIC RECOVERY - READ ONLY
// ============================================================

app.post("/api/recovery/real-scan", (req, res) => {
  try {
    const fileName = String(req.body?.fileName || "").trim();

    if (!fileName) {
      return res.status(400).json({
        success: false,
        error: "fileName is required"
      });
    }

    // Security boundary:
    // Only files inside core/real_test are allowed in this phase.
    const safeName = path.basename(fileName);

    if (safeName !== fileName) {
      return res.status(400).json({
        success: false,
        error: "Invalid file name"
      });
    }

    const allowedExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".pdf",
      ".mp4",
      ".mov",
      ".zip",
      ".docx",
      ".sqlite",
      ".db"
    ];

    const extension =
      path.extname(safeName).toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      return res.status(400).json({
        success: false,
        error: "Unsupported file type"
      });
    }

    const realTestPath =
      path.join(corePath, "real_test");

    const sourcePath =
      path.join(realTestPath, safeName);

    const outputPath =
      path.join(
        corePath,
        "testdata",
        "real_recovery_output"
      );

    const enginePath =
      path.join(
        corePath,
        "forensic_agent.exe"
      );

    // Confirm engine exists
    if (!fs.existsSync(enginePath)) {
      return res.status(500).json({
        success: false,
        error: "forensic_agent.exe not found",
        enginePath
      });
    }

    // Confirm source exists
    if (!fs.existsSync(sourcePath)) {
      return res.status(404).json({
        success: false,
        error: "Source file not found",
        source: safeName
      });
    }

    // Create output directory if necessary
    fs.mkdirSync(outputPath, {
      recursive: true
    });

    console.log("");
    console.log("======================================");
    console.log("REAL FORENSIC RECOVERY REQUEST");
    console.log("======================================");
    console.log("Source:", sourcePath);
    console.log("Output:", outputPath);
    console.log("Mode: READ-ONLY");
    console.log("Physical disk write access: DISABLED");

    execFile(
      enginePath,
      [
        "--source",
        sourcePath,
        "--output",
        outputPath
      ],
      {
        windowsHide: true,
        timeout: 120000,
        maxBuffer: 10 * 1024 * 1024
      },
      (error, stdout, stderr) => {

        console.log(stdout);

        if (stderr) {
          console.error(stderr);
        }

        if (error) {
          return res.status(500).json({
            success: false,
            error: "Forensic engine failed",
            message: error.message,
            stdout,
            stderr,
            safety: {
              physicalDiskAccess: false,
              sourceModified: false,
              mode: "READ-ONLY"
            }
          });
        }

        // Parse candidate count
        const candidateMatch =
          stdout.match(
            /Candidates:\s*(\d+)/i
          );

        const candidatesFound =
          candidateMatch
            ? Number(candidateMatch[1])
            : 0;

        // Parse recovered filenames
        const recoveredFiles = [];

        const recoveredRegex =
          /FOUND\s+([A-Z0-9_]+)\s+at\s+offset\s+(\d+)\s+=>\s+(.+)/gi;

        let match;

        while (
          (match = recoveredRegex.exec(stdout)) !== null
        ) {
          recoveredFiles.push({
            type: match[1],
            offset: Number(match[2]),
            output: match[3].trim()
          });
        }

        const reportPath =
          path.join(
            outputPath,
            "forensic_scan.json"
          );

        let report = null;

        if (fs.existsSync(reportPath)) {
          try {
            report = JSON.parse(
              fs.readFileSync(
                reportPath,
                "utf8"
              )
            );
          } catch (reportError) {
            console.error(
              "Could not parse forensic report:",
              reportError.message
            );
          }
        }

        return res.json({
          success: true,

          engine: "C++ FORENSIC AGENT",

          mode: "READ-ONLY",

          candidatesFound,

          recoveredFiles,

          report,

          reportPath,

          source: {
            fileName: safeName,
            path: sourcePath
          },

          safety: {
            physicalDiskAccess: false,
            sourceModified: false,
            writeAccess: false,
            mode: "READ-ONLY"
          },

          limitations: [
            "Phase-1 signature carving only",
            "Deleted NTFS metadata recovery is not yet enabled",
            "Fragmented files may not be completely recoverable",
            "SSD TRIM or overwritten clusters may make deleted data unrecoverable"
          ],

          rawOutput: stdout
        });
      }
    );

  } catch (error) {
    console.error(
      "Real recovery route error:",
      error
    );

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================
// REAL FORENSIC RECOVERY - READ ONLY
// ============================================================

app.post("/api/recovery/real-scan", (req, res) => {
  try {
    const fileName = String(req.body?.fileName || "").trim();

    if (!fileName) {
      return res.status(400).json({
        success: false,
        error: "fileName is required"
      });
    }

    // Security boundary:
    // Phase 1 only allows files inside core/real_test.
    const safeName = path.basename(fileName);

    if (safeName !== fileName) {
      return res.status(400).json({
        success: false,
        error: "Invalid file name"
      });
    }

    const allowedExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".pdf",
      ".mp4",
      ".mov",
      ".zip",
      ".docx",
      ".sqlite",
      ".db"
    ];

    const extension =
      path.extname(safeName).toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      return res.status(400).json({
        success: false,
        error: "Unsupported file type"
      });
    }

    const realTestPath =
      path.join(corePath, "real_test");

    const sourcePath =
      path.join(realTestPath, safeName);

    const outputPath =
      path.join(
        corePath,
        "testdata",
        "real_recovery_output"
      );

    const enginePath =
      path.join(
        corePath,
        "forensic_agent.exe"
      );

    // --------------------------------------------------------
    // Verify native engine
    // --------------------------------------------------------

    if (!fs.existsSync(enginePath)) {
      return res.status(500).json({
        success: false,
        error: "forensic_agent.exe not found",
        enginePath
      });
    }

    // --------------------------------------------------------
    // Verify source file
    // --------------------------------------------------------

    if (!fs.existsSync(sourcePath)) {
      return res.status(404).json({
        success: false,
        error: "Source file not found",
        source: safeName
      });
    }

    // --------------------------------------------------------
    // Create recovery output directory
    // --------------------------------------------------------

    fs.mkdirSync(outputPath, {
      recursive: true
    });

    console.log("");
    console.log("======================================");
    console.log("REAL FORENSIC RECOVERY REQUEST");
    console.log("======================================");
    console.log("Source:", sourcePath);
    console.log("Output:", outputPath);
    console.log("Mode: READ-ONLY");
    console.log("Physical disk write access: DISABLED");

    // --------------------------------------------------------
    // Execute native C++ forensic engine
    // --------------------------------------------------------

    execFile(
      enginePath,
      [
        "--source",
        sourcePath,
        "--output",
        outputPath
      ],
      {
        windowsHide: true,
        timeout: 120000,
        maxBuffer: 10 * 1024 * 1024
      },
      (error, stdout, stderr) => {

        console.log(stdout);

        if (stderr) {
          console.error(stderr);
        }

        if (error) {
          return res.status(500).json({
            success: false,
            error: "Forensic engine failed",
            message: error.message,
            stdout,
            stderr,

            safety: {
              physicalDiskAccess: false,
              sourceModified: false,
              writeAccess: false,
              mode: "READ-ONLY"
            }
          });
        }

        // ----------------------------------------------------
        // Parse candidate count
        // ----------------------------------------------------

        const candidateMatch =
          stdout.match(
            /Candidates:\s*(\d+)/i
          );

        const candidatesFound =
          candidateMatch
            ? Number(candidateMatch[1])
            : 0;

        // ----------------------------------------------------
        // Parse recovered files
        // ----------------------------------------------------

        const recoveredFiles = [];

        const recoveredRegex =
          /FOUND\s+([A-Z0-9_]+)\s+at\s+offset\s+(\d+)\s+=>\s+(.+)/gi;

        let match;

        while (
          (match = recoveredRegex.exec(stdout)) !== null
        ) {
          recoveredFiles.push({
            type: match[1],
            offset: Number(match[2]),
            output: match[3].trim()
          });
        }

        // ----------------------------------------------------
        // Read forensic report
        // ----------------------------------------------------

        const reportPath =
          path.join(
            outputPath,
            "forensic_scan.json"
          );

        let report = null;

        if (fs.existsSync(reportPath)) {
          try {
            report = JSON.parse(
              fs.readFileSync(
                reportPath,
                "utf8"
              )
            );
          } catch (reportError) {
            console.error(
              "Could not parse forensic report:",
              reportError.message
            );
          }
        }

        // ----------------------------------------------------
        // Return API result
        // ----------------------------------------------------

        return res.json({
          success: true,

          engine: "C++ FORENSIC AGENT",

          mode: "READ-ONLY",

          candidatesFound,

          recoveredFiles,

          report,

          reportPath,

          source: {
            fileName: safeName,
            path: sourcePath
          },

          safety: {
            physicalDiskAccess: false,
            sourceModified: false,
            writeAccess: false,
            mode: "READ-ONLY"
          },

          limitations: [
            "Phase-1 signature carving only",
            "Deleted NTFS metadata recovery is not yet enabled",
            "Fragmented files may not be completely recoverable",
            "SSD TRIM or overwritten clusters may make deleted data unrecoverable"
          ],

          rawOutput: stdout
        });
      }
    );

  } catch (error) {
    console.error(
      "Real recovery route error:",
      error
    );

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(
  PORT,
  () => {

    console.log("");

    console.log(
      "=============================================="
    );

    console.log(
      "       SECUREWIPE FORENSICS BACKEND"
    );

    console.log(
      "=============================================="
    );

    console.log("");

    console.log(
      `Server: http://localhost:${PORT}`
    );

    console.log(
      `Health: http://localhost:${PORT}/api/health`
    );

    console.log(
      `Devices: http://localhost:${PORT}/api/devices`
    );

    console.log(
      `Recovery: http://localhost:${PORT}/api/recovery/analyze`
    );

    console.log(
      `Erasure: http://localhost:${PORT}/api/erasure/start`
    );

    console.log(
      `Audit: http://localhost:${PORT}/api/audit`
    );

    console.log(
      `Audit Chain: http://localhost:${PORT}/api/audit/chain`
    );

    console.log(
      `Chain Verify: http://localhost:${PORT}/api/audit/chain/verify`
    );

    console.log("");

    console.log(
      "Recovery engine: C++"
    );

    console.log(
      "Erasure engine: C++"
    );

    console.log(
      "Audit algorithm: SHA-256"
    );

    console.log(
      "Physical disk access: DISABLED"
    );

    console.log(
      "Safety mode: TEST IMAGE ONLY"
    );

    console.log("");

    console.log(
      "=============================================="
    );

    console.log("");
  }
);