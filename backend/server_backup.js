require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const app = express();

const PORT = process.env.PORT || 5000;

/*
|--------------------------------------------------------------------------
| Middleware
|--------------------------------------------------------------------------
*/

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  })
);

app.use(express.json({ limit: "1mb" }));


/*
|--------------------------------------------------------------------------
| Demo data
|--------------------------------------------------------------------------
|
| These are intentionally simulated.
| No physical disk is accessed or modified.
|
*/

const devices = [
  {
    id: "TEST-DRIVE-01",
    type: "HDD",
    capacity: "500 GB",
    interface: "SATA",
    status: "READY",
    health: "98%",
    serial: "SWF-HDD-001",
  },
  {
    id: "FORENSIC-USB",
    type: "USB",
    capacity: "64 GB",
    interface: "USB 3.0",
    status: "READY",
    health: "100%",
    serial: "SWF-USB-002",
  },
  {
    id: "RECOVERY-IMAGE-01",
    type: "DISK IMAGE",
    capacity: "32 GB",
    interface: "IMAGE",
    status: "ANALYZED",
    health: "N/A",
    serial: "SWF-IMG-003",
  },
];


/*
|--------------------------------------------------------------------------
| Health check
|--------------------------------------------------------------------------
*/

app.get("/api/health", (req, res) => {

  res.json({
    success: true,
    service: "SecureWipe Forensics Backend",
    status: "ONLINE",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });

});


/*
|--------------------------------------------------------------------------
| API information
|--------------------------------------------------------------------------
*/

app.get("/api", (req, res) => {

  res.json({
    success: true,
    name: "SecureWipe Forensics API",
    version: "1.0.0",

    modules: [
      "Device Manager",
      "Recovery Workspace",
      "Erasure Console",
      "Audit & Certificates",
    ],

    safetyMode: "SIMULATION",
  });

});


/*
|--------------------------------------------------------------------------
| Device Manager
|--------------------------------------------------------------------------
*/


app.get("/api/devices", (req, res) => {

  res.json({
    success: true,
    count: devices.length,
    devices,
  });

});


/*
|--------------------------------------------------------------------------
| Device scan
|--------------------------------------------------------------------------
|
| This endpoint currently simulates a hardware scan.
| Later this will communicate with the C/C++ core.
|
*/

app.post("/api/devices/scan", async (req, res) => {

  await new Promise((resolve) =>
    setTimeout(resolve, 1200)
  );

  res.json({
    success: true,
    message: "Device scan completed.",
    mode: "SIMULATION",
    count: devices.length,
    devices,
  });

});


/*
|--------------------------------------------------------------------------
| Device details
|--------------------------------------------------------------------------
*/

app.get("/api/devices/:id", (req, res) => {

  const device = devices.find(
    (item) => item.id === req.params.id
  );

  if (!device) {

    return res.status(404).json({
      success: false,
      message: "Device not found.",
    });

  }

  res.json({
    success: true,
    device,
  });

});


/*
|--------------------------------------------------------------------------
| Recovery analysis
|--------------------------------------------------------------------------
|
| Simulated until the C/C++ carving engine is connected.
|
*/

app.post("/api/recovery/analyze", async (req, res) => {

  const target = req.body?.target || "RECOVERY-IMAGE-01";

  await new Promise((resolve) =>
    setTimeout(resolve, 1500)
  );

  res.json({
    success: true,

    mode: "SIMULATION",

    target,

    statistics: {
      sectorsAnalyzed: 1048576,
      candidatesFound: 128,
      highRelevance: 23,
      averageRecoverability: 87,
    },

    message:
      "Recovery analysis completed successfully.",
  });

});


/*
|--------------------------------------------------------------------------
| Erasure simulation
|--------------------------------------------------------------------------
|
| IMPORTANT:
| This endpoint DOES NOT erase a physical disk.
|
| It demonstrates the API workflow only.
|
*/

app.post("/api/erasure/simulate", async (req, res) => {

  const {
    target = "TEST-DRIVE-01",
    method = "NIST 800-88 Clear",
  } = req.body || {};

  await new Promise((resolve) =>
    setTimeout(resolve, 1200)
  );

  res.json({
    success: true,

    mode: "SIMULATION",

    target,

    method,

    progress: 100,

    verification: {
      status: "PASS",
      sectorsVerified: 1048576,
    },

    message:
      "Erasure workflow simulation completed. No physical storage was modified.",
  });

});


/*
|--------------------------------------------------------------------------
| Audit
|--------------------------------------------------------------------------
*/

app.get("/api/audit", (req, res) => {

  res.json({
    success: true,

    records: [
      {
        id: "AUDIT-001",
        operator: "investigator",
        action: "DEVICE_SCAN",
        target: "RECOVERY-IMAGE-01",
        status: "SUCCESS",
        timestamp: new Date().toISOString(),
      },

      {
        id: "AUDIT-002",
        operator: "investigator",
        action: "RECOVERY_ANALYSIS",
        target: "RECOVERY-IMAGE-01",
        status: "SUCCESS",
        timestamp: new Date().toISOString(),
      },
    ],
  });

});


/*
|--------------------------------------------------------------------------
| Certificates
|--------------------------------------------------------------------------
*/

app.get("/api/certificates", (req, res) => {

  res.json({
    success: true,

    certificates: [
      {
        id: "SWF-CERT-2026-001",
        device: "TEST-DRIVE-01",
        method: "NIST 800-88 Clear",
        status: "VERIFIED",
        hash: "8A72...F921",
      },

      {
        id: "SWF-CERT-2026-002",
        device: "FORENSIC-USB",
        method: "Random Overwrite",
        status: "VERIFIED",
        hash: "A19C...71DE",
      },
    ],
  });

});


/*
|--------------------------------------------------------------------------
| 404 handler
|--------------------------------------------------------------------------
*/

app.use((req, res) => {

  res.status(404).json({
    success: false,
    message: "API endpoint not found.",
    path: req.originalUrl,
  });

});


/*
|--------------------------------------------------------------------------
| Error handler
|--------------------------------------------------------------------------
*/

app.use((err, req, res, next) => {

  console.error(err);

  res.status(500).json({
    success: false,
    message: "Internal server error.",
  });

});


/*
|--------------------------------------------------------------------------
| Start server
|--------------------------------------------------------------------------
*/

app.listen(PORT, () => {

  console.log("");
  console.log("==============================================");
  console.log("       SECUREWIPE FORENSICS BACKEND");
  console.log("==============================================");
  console.log("");
  console.log(`Server: http://localhost:${PORT}`);
  console.log(`Health: http://localhost:${PORT}/api/health`);
  console.log(`Devices: http://localhost:${PORT}/api/devices`);
  console.log("");
  console.log("Safety mode: SIMULATION");
  console.log("No physical storage will be modified.");
  console.log("");
  console.log("==============================================");
  console.log("");

});