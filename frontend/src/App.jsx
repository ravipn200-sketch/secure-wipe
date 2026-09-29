import { useEffect, useMemo, useState } from "react";

// Shared backend API URL. Works on localhost and LAN devices.
const API_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? `https://secure-wipe-p6in.onrender.com/api`
    : "https://secure-wipe-p6in.onrender.com/api";

import {
  Activity,
  AlertTriangle,
  Archive,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Binary,
  BookOpen,
  Box,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Clock3,
  Cpu,
  Database,
  Download,
  Eye,
  FileArchive,
  FileCode2,
  FileImage,
  FileText,
  FileCheck,
  HardDrive,
  KeyRound,
  LayoutDashboard,
  Lock,
  LogIn,
  Link2,
  Menu,
  Network,
  Play,
  RefreshCw,
  Search,
  Server,
  Settings,
  Shield,
  ShieldCheck,
  Sparkles,
  Terminal,
  Trash2,
  Upload,
  User,
  Users,
  X,
  Zap,
} from "lucide-react";

import "./App.css";


/* =========================================================
   DEMO DATA
========================================================= */

const devices = [
  {
    id: "TEST-DRIVE-01",
    type: "HDD",
    size: "500 GB",
    interface: "SATA",
    status: "READY",
    health: "98%",
    serial: "SWF-HDD-001",
  },
  {
    id: "FORENSIC-USB",
    type: "USB",
    size: "64 GB",
    interface: "USB 3.0",
    status: "READY",
    health: "100%",
    serial: "SWF-USB-002",
  },
  {
    id: "RECOVERY-IMAGE-01",
    type: "DISK IMAGE",
    size: "32 GB",
    interface: "IMAGE",
    status: "ANALYZED",
    health: "—",
    serial: "SWF-IMG-003",
  },
];

const recoveryFiles = [
  {
    name: "IMG_00482.jpg",
    type: "JPEG",
    icon: FileImage,
    size: "4.8 MB",
    recovery: 96,
    relevance: 92,
    status: "Recoverable",
  },
  {
    name: "financial_report.pdf",
    type: "PDF",
    icon: FileText,
    size: "1.7 MB",
    recovery: 89,
    relevance: 96,
    status: "Recoverable",
  },
  {
    name: "evidence_archive.docx",
    type: "DOCX",
    icon: FileText,
    size: "3.2 MB",
    recovery: 81,
    relevance: 88,
    status: "Partial",
  },
  {
    name: "browser_history.sqlite",
    type: "SQLite",
    icon: Database,
    size: "12.4 MB",
    recovery: 74,
    relevance: 91,
    status: "Partial",
  },
  {
    name: "unknown_fragment.bin",
    type: "Binary",
    icon: Binary,
    size: "812 KB",
    recovery: 43,
    relevance: 37,
    status: "Corrupted",
  },
];

const certificates = [
  {
    id: "SWF-CERT-2026-001",
    device: "TEST-DRIVE-01",
    method: "NIST 800-88 Clear",
    date: "13 Sep 2026",
    hash: "8A72...F921",
    status: "VERIFIED",
  },
  {
    id: "SWF-CERT-2026-002",
    device: "FORENSIC-USB",
    method: "Random Overwrite",
    date: "12 Sep 2026",
    hash: "A19C...71DE",
    status: "VERIFIED",
  },
];


/* =========================================================
   LOGIN
========================================================= */

function Login({ onLogin }) {
  const [role, setRole] = useState("Forensic Investigator");
  const [username, setUsername] = useState("investigator");
  const [password, setPassword] = useState("SecureWipe@123");
  const [error, setError] = useState("");

  function submit(e) {
    e.preventDefault();

    if (!username || !password) {
      setError("Enter username and password.");
      return;
    }

    setError("");
    onLogin({
      username,
      role,
    });
  }

  return (
    <div className="login-page">

      <div className="login-grid" />

      <div className="login-glow glow-one" />
      <div className="login-glow glow-two" />

      <div className="login-shell">

        <div className="login-brand">
          <div className="brand-logo large">
            <ShieldCheck size={34} />
          </div>

          <div>
            <h1>
              Secure<span>Wipe</span>
            </h1>
            <p>FORENSICS PLATFORM</p>
          </div>
        </div>

        <div className="login-card">

          <div className="login-card-top">
            <div>
              <div className="eyebrow">SECURE ACCESS</div>
              <h2>Welcome back</h2>
              <p>Authenticate to access forensic operations.</p>
            </div>

            <div className="secure-badge">
              <Lock size={16} />
              TLS SECURE
            </div>
          </div>

          <form onSubmit={submit}>

            <label>OPERATOR ID</label>

            <div className="input-wrap">
              <User size={18} />
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter operator ID"
              />
            </div>

            <label>PASSWORD</label>

            <div className="input-wrap">
              <KeyRound size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
              />
            </div>

            <label>ACCESS ROLE</label>

            <div className="role-grid">

              {[
                "Forensic Investigator",
                "Administrator",
                "Auditor",
              ].map((item) => (
                <button
                  type="button"
                  key={item}
                  className={`role-option ${
                    role === item ? "active" : ""
                  }`}
                  onClick={() => setRole(item)}
                >
                  {item === "Administrator" && <Shield size={16} />}
                  {item === "Forensic Investigator" && <Search size={16} />}
                  {item === "Auditor" && <BookOpen size={16} />}

                  <span>{item}</span>
                </button>
              ))}

            </div>

            {error && (
              <div className="login-error">
                <AlertTriangle size={16} />
                {error}
              </div>
            )}

            <button className="login-button">
              <LogIn size={18} />
              Sign In
              <ArrowRight size={18} />
            </button>

          </form>

          <div className="login-footer">
            <span>
              <CheckCircle2 size={14} />
              Authorized forensic environment
            </span>

            <span>
              v1.0.0
            </span>
          </div>

        </div>

        <div className="login-system-status">
          <span className="status-dot green" />
          SECUREWIPE CORE ONLINE

          <span className="separator">•</span>

          <span>SHA-256</span>

          <span className="separator">•</span>

          <span>RBAC ENABLED</span>
        </div>

      </div>
    </div>
  );
}


/* =========================================================
   SMALL COMPONENTS
========================================================= */

function StatCard({
  icon: Icon,
  title,
  value,
  subtitle,
  trend,
}) {
  return (
    <div className="stat-card">

      <div className="stat-icon">
        <Icon size={22} />
      </div>

      <div className="stat-content">
        <span>{title}</span>
        <strong>{value}</strong>
        <small>{subtitle}</small>
      </div>

      {trend && (
        <div className="stat-trend">
          {trend}
        </div>
      )}

    </div>
  );
}


function PageHeading({
  eyebrow,
  title,
  description,
  action,
  onAction,
}) {
  return (
    <div className="page-heading">

      <div>
        <div className="eyebrow">{eyebrow}</div>

        <h1>{title}</h1>

        <p>{description}</p>
      </div>

      {action && (
        <button
          className="primary-button"
          onClick={onAction}
        >
          <Zap size={17} />
          {action}
        </button>
      )}

    </div>
  );
}


/* =========================================================
   3D DISK
========================================================= */

function DiskVisualization({ progress = 54 }) {

  const sectors = useMemo(
    () =>
      Array.from({ length: 64 }, (_, index) => ({
        id: index,
        state:
          index < Math.floor((progress / 100) * 64)
            ? "active"
            : index % 9 === 0
            ? "warning"
            : "idle",
      })),
    [progress]
  );

  return (
    <div className="disk-panel">

      <div className="panel-heading">
        <div>
          <div className="eyebrow">LIVE STORAGE VIEW</div>
          <h3>Sector Visualization</h3>
        </div>

        <div className="live-indicator">
          <span className="status-dot green" />
          LIVE
        </div>
      </div>

      <div className="disk-stage">

        <div className="disk-ring ring-one" />
        <div className="disk-ring ring-two" />
        <div className="disk-ring ring-three" />

        <div className="disk-core">
          <ShieldCheck size={38} />
          <span>{progress}%</span>
          <small>ANALYZED</small>
        </div>

        <div className="disk-sector-orbit">

          {sectors.map((sector) => (
            <div
              key={sector.id}
              className={`sector sector-${sector.state}`}
              style={{
                "--angle": `${sector.id * 5.625}deg`,
              }}
            />
          ))}

        </div>

      </div>

      <div className="disk-legend">

        <span>
          <i className="legend-active" />
          Processed
        </span>

        <span>
          <i className="legend-warning" />
          Attention
        </span>

        <span>
          <i className="legend-idle" />
          Pending
        </span>

      </div>

    </div>
  );
}


/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard({ navigate }) {

  return (
    <>

      <PageHeading
        eyebrow="SECURE FORENSIC OPERATIONS"
        title="Command Dashboard"
        description="Unified control center for evidence recovery, secure erasure and audit operations."
      />

      <div className="stats-grid">

        <StatCard
          icon={HardDrive}
          title="CONNECTED DEVICES"
          value="03"
          subtitle="2 physical • 1 image"
          trend="+1"
        />

        <StatCard
          icon={FileArchive}
          title="RECOVERY CANDIDATES"
          value="128"
          subtitle="23 high relevance"
          trend="+12"
        />

        <StatCard
          icon={ShieldCheck}
          title="ERASURE JOBS"
          value="17"
          subtitle="100% verified"
          trend="100%"
        />

        <StatCard
          icon={BadgeCheck}
          title="CERTIFICATES"
          value="17"
          subtitle="Blockchain anchored"
          trend="VALID"
        />

      </div>

      <div className="dashboard-grid">

        <DiskVisualization progress={68} />

        <div className="panel system-panel">

          <div className="panel-heading">
            <div>
              <div className="eyebrow">PLATFORM HEALTH</div>
              <h3>System Status</h3>
            </div>

            <Activity size={20} />
          </div>

          {[
            ["SecureWipe Core", "ONLINE", "99.99%"],
            ["Recovery Engine", "ONLINE", "98.7%"],
            ["AI Classifier", "ONLINE", "96.2%"],
            ["Audit Ledger", "CONNECTED", "100%"],
          ].map(([name, status, value]) => (

            <div className="system-row" key={name}>

              <div className="system-name">
                <span className="status-dot green" />
                <span>{name}</span>
              </div>

              <div className="system-value">
                <strong>{status}</strong>
                <small>{value}</small>
              </div>

            </div>

          ))}

          <button
            className="secondary-button full"
            onClick={() => navigate("Device Manager")}
          >
            Open Device Manager
            <ChevronRight size={17} />
          </button>

        </div>

      </div>

      <div className="panel">

        <div className="panel-heading">

          <div>
            <div className="eyebrow">AUTHORIZED STORAGE</div>
            <h3>Connected Devices</h3>
          </div>

          <button
            className="ghost-button"
            onClick={() => navigate("Device Manager")}
          >
            View all
            <ArrowRight size={16} />
          </button>

        </div>

        <div className="device-mini-grid">

          {devices.map((device) => (

            <div className="device-card" key={device.id}>

              <div className="device-icon">
                <HardDrive size={22} />
              </div>

              <div className="device-info">
                <strong>{device.id}</strong>
                <span>
                  {device.type} • {device.size}
                </span>
              </div>

              <div className="ready-status">
                <span className="status-dot green" />
                {device.status}
              </div>

            </div>

          ))}

        </div>

      </div>

    </>
  );
}


/* =========================================================
   DEVICE MANAGER
========================================================= */

function DeviceManager() {
  const [devices, setDevices] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = `https://secure-wipe-p6in.onrender.com/api`;

  // Load devices from backend when the page opens
  useEffect(() => {
    loadDevices();
  }, []);

  async function loadDevices() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/devices`);

      if (!response.ok) {
        throw new Error("Backend request failed");
      }

      const data = await response.json();

      if (data.success) {
        setDevices(data.devices || []);
      } else {
        throw new Error(data.message || "Unable to load devices");
      }
    } catch (err) {
      console.error("Device loading error:", err);
      setError(
        "Unable to connect to SecureWipe backend. Make sure the backend is running on port 5000."
      );
    } finally {
      setLoading(false);
    }
  }

  // Scan devices through the backend
  async function scanDevices() {
    try {
      setScanning(true);
      setError("");

      const response = await fetch(`${API_URL}/devices/scan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Device scan failed");
      }

      const data = await response.json();

      if (data.success) {
        setDevices(data.devices || []);
      } else {
        throw new Error(data.message || "Device scan failed");
      }
    } catch (err) {
      console.error("Device scan error:", err);

      setError(
        "Device scan failed. Check that the SecureWipe backend is running."
      );
    } finally {
      setScanning(false);
    }
  }

  return (
    <>
      <PageHeading
        eyebrow="FORENSIC STORAGE"
        title="Device Manager"
        description="Manage authorized forensic storage targets before analysis or sanitization."
        action={scanning ? "Scanning..." : "Scan Devices"}
        onAction={scanDevices}
      />

      {/* SUMMARY */}
      <div className="device-summary-grid">
        <StatCard
          icon={HardDrive}
          title="PHYSICAL DEVICES"
          value={
            devices.filter(
              (device) =>
                device.type === "HDD" ||
                device.type === "SSD" ||
                device.type === "USB"
            ).length.toString().padStart(2, "0")
          }
          subtitle="Physical storage"
        />

        <StatCard
          icon={Archive}
          title="DISK IMAGES"
          value={devices
            .filter((device) => device.type === "DISK IMAGE")
            .length.toString()
            .padStart(2, "0")}
          subtitle="Forensic images"
        />

        <StatCard
          icon={Shield}
          title="AUTHORIZED"
          value={devices.length.toString().padStart(2, "0")}
          subtitle="Detected targets"
        />
      </div>

      {/* DEVICE TABLE */}
      <div className="panel">
        <div className="panel-heading">
          <div>
            <div className="eyebrow">STORAGE INVENTORY</div>
            <h3>Backend Device Inventory</h3>
          </div>

          {scanning && (
            <div className="scanning">
              <RefreshCw size={15} className="spin" />
              Hardware scan in progress
            </div>
          )}
        </div>

        {/* BACKEND ERROR */}
        {error && (
          <div className="warning-box">
            <AlertTriangle size={21} />

            <div>
              <strong>Backend Connection Error</strong>

              <p>{error}</p>

              <button
                className="secondary-button"
                style={{ marginTop: "10px" }}
                onClick={loadDevices}
              >
                <RefreshCw size={15} />
                Retry Connection
              </button>
            </div>
          </div>
        )}

        {/* LOADING */}
        {loading && !error && (
          <div
            style={{
              minHeight: "180px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              gap: "12px",
              color: "var(--muted)",
            }}
          >
            <RefreshCw className="spin" size={28} />

            <span>Loading devices from SecureWipe backend...</span>
          </div>
        )}

        {/* TABLE */}
        {!loading && !error && (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>DEVICE</th>
                  <th>TYPE</th>
                  <th>CAPACITY</th>
                  <th>INTERFACE</th>
                  <th>HEALTH</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>

              <tbody>
                {devices.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      style={{
                        textAlign: "center",
                        padding: "40px",
                      }}
                    >
                      No authorized devices detected.
                    </td>
                  </tr>
                ) : (
                  devices.map((device) => (
                    <tr key={device.id}>
                      <td>
                        <div className="table-device">
                          <div className="mini-icon">
                            <HardDrive size={17} />
                          </div>

                          <div>
                            <strong>{device.id}</strong>

                            <small>
                              {device.serial || "SERIAL-N/A"}
                            </small>
                          </div>
                        </div>
                      </td>

                      <td>{device.type}</td>

                      <td>{device.capacity}</td>

                      <td>{device.interface}</td>

                      <td>
                        <span className="health">
                          {device.health || "N/A"}
                        </span>
                      </td>

                      <td>
                        <span className="table-status">
                          <span className="status-dot green" />

                          {device.status}
                        </span>
                      </td>

                      <td>
                        <button
                          className="icon-button"
                          title={`View ${device.id}`}
                          onClick={() =>
                            alert(
                              `Device: ${device.id}\nType: ${device.type}\nCapacity: ${device.capacity}\nInterface: ${device.interface}\nStatus: ${device.status}`
                            )
                          }
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SAFETY MESSAGE */}
      <div className="warning-box">
        <AlertTriangle size={21} />

        <div>
          <strong>Forensic safety boundary</strong>

          <p>
            Device information is currently supplied by the SecureWipe
            backend in simulation mode. No physical storage is modified.
            Actual device-level operations will only be introduced after
            explicit target authorization and safety verification.
          </p>
        </div>
      </div>
    </>
  );
}


/* =========================================================
   RECOVERY WORKSPACE
========================================================= */

function RecoveryWorkspace() {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [error, setError] = useState("");

  const [statistics, setStatistics] = useState({
    sectorsAnalyzed: 0,
    candidatesFound: 0,
    highRelevance: 0,
    averageRecoverability: 0,
  });

  const [recoveredFiles, setRecoveredFiles] = useState([]);
  const [filter, setFilter] = useState("All");
const API_URL = `https://secure-wipe-p6in.onrender.com/api`;

  const recoveryFiles = [
    {
      name: "IMG_00482.jpg",
      type: "JPEG",
      icon: FileImage,
      size: "4.8 MB",
      recovery: 96,
      relevance: 92,
      status: "Recoverable",
    },
    {
      name: "financial_report.pdf",
      type: "PDF",
      icon: FileText,
      size: "1.7 MB",
      recovery: 89,
      relevance: 96,
      status: "Recoverable",
    },
    {
      name: "evidence_archive.docx",
      type: "DOCX",
      icon: FileText,
      size: "3.2 MB",
      recovery: 81,
      relevance: 88,
      status: "Partial",
    },
    {
      name: "browser_history.sqlite",
      type: "SQLite",
      icon: Database,
      size: "12.4 MB",
      recovery: 74,
      relevance: 91,
      status: "Partial",
    },
    {
      name: "unknown_fragment.bin",
      type: "Binary",
      icon: Binary,
      size: "812 KB",
      recovery: 43,
      relevance: 37,
      status: "Corrupted",
    },
  ];

  function getFileIcon(type) {
    switch ((type || "").toUpperCase()) {
      case "JPEG":
      case "JPG":
      case "PNG":
        return FileImage;
      case "PDF":
      case "DOCX":
        return FileText;
      case "SQLITE":
        return Database;
      default:
        return Binary;
    }
  }

  async function analyzeImage() {
    if (analyzing) return;

    try {
      setAnalyzing(true);
      setAnalysisComplete(false);
      setError("");

      const response = await fetch(
        `${API_URL}/recovery/analyze`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            target: "RECOVERY-IMAGE-01",
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Backend returned ${response.status}`
        );
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(
          data.message ||
          "Recovery analysis failed"
        );
      }

      setStatistics({
        sectorsAnalyzed:
          data.statistics?.sectorsAnalyzed ||
          data.statistics?.imageSizeBytes ||
          0,

        candidatesFound:
          data.statistics?.candidatesFound || 0,

        highRelevance:
          data.statistics?.highRelevance || 0,

        averageRecoverability:
          data.statistics?.averageRecoverability || 0,
      });

      setRecoveredFiles(
        (data.recoveredFiles || []).map(
          (file, index) => ({
            name:
              file.name ||
              `recovered_${index + 1}${file.extension || ".bin"}`,

            type:
              file.type ||
              "Binary",

            icon:
              getFileIcon(file.type),

            size:
              file.size ||
              "Detected",

            recovery:
              file.recovery ??
              100,

            relevance:
              file.relevance ??
              100,

            status:
              file.status ||
              "Recoverable",

            offset:
              file.offset ??
              null,

            sha256:
              file.sha256 ||
              null,
          })
        )
      );

      setAnalysisComplete(true);

    } catch (err) {
      console.error(
        "Recovery analysis error:",
        err
      );

      setError(
        err.message ||
        "Unable to connect to the recovery service."
      );

    } finally {
      setAnalyzing(false);
    }
  }

  const filesToDisplay =
    analysisComplete &&
    recoveredFiles.length > 0
      ? recoveredFiles
      : recoveryFiles;

  const filteredFiles =
    filesToDisplay.filter(
      (file) => {
        if (filter === "All") return true;
        return file.type === filter;
      }
    );

  return (
    <>
      <PageHeading
        eyebrow="EVIDENCE ANALYSIS"
        title="Recovery Workspace"
        description="Analyze storage sectors and prioritize recoverable forensic evidence."
        action={
          analyzing
            ? "Analyzing..."
            : "Analyze Image"
        }
        onAction={analyzeImage}
      />

      <div className="recovery-top-grid">

        <div className="panel analysis-card">

          <div className="analysis-visual">

            {analyzing ? (
              <RefreshCw
                size={42}
                className="spin"
              />
            ) : analysisComplete ? (
              <CheckCircle2 size={42} />
            ) : (
              <Search size={42} />
            )}

            <div className="analysis-pulse" />

          </div>

          <div>

            <div className="eyebrow">
              CURRENT TARGET
            </div>

            <h3>
              RECOVERY-IMAGE-01
            </h3>

            <p>
              32 GB forensic disk image ready
              for sector analysis.
            </p>

            <div className="analysis-progress">

              <div className="progress-header">

                <span>
                  {analyzing
                    ? "Analyzing sectors"
                    : analysisComplete
                    ? "Analysis completed"
                    : "Ready for analysis"}
                </span>

                <strong>
                  {analyzing
                    ? "..."
                    : analysisComplete
                    ? "100%"
                    : "0%"}
                </strong>

              </div>

              <div className="progress-bar">

                <div
                  style={{
                    width:
                      analyzing
                        ? "65%"
                        : analysisComplete
                        ? "100%"
                        : "0%",
                  }}
                />

              </div>

            </div>

          </div>

        </div>


        <div className="panel">

          <div className="panel-heading">

            <div>

              <div className="eyebrow">
                FORENSIC TRIAGE
              </div>

              <h3>
                Evidence Intelligence
              </h3>

            </div>

            <Sparkles size={21} />

          </div>

          <div className="ai-metrics">

            <div>
              <strong>
                {statistics.candidatesFound}
              </strong>

              <span>
                Candidates
              </span>
            </div>

            <div>
              <strong>
                {statistics.highRelevance}
              </strong>

              <span>
                High relevance
              </span>
            </div>

            <div>
              <strong>
                {statistics.averageRecoverability}%
              </strong>

              <span>
                Avg. recovery
              </span>
            </div>

          </div>

        </div>

      </div>


      {error && (
        <div className="warning-box">

          <AlertTriangle size={21} />

          <div>

            <strong>
              Recovery Service Error
            </strong>

            <p>
              {error}
            </p>

          </div>

        </div>
      )}


      {analysisComplete && (
        <div
          className="blockchain-panel"
          style={{ marginBottom: "15px" }}
        >

          <div className="blockchain-icon">
            <CheckCircle2 size={25} />
          </div>

          <div>

            <div className="eyebrow">
              C++ ENGINE COMPLETE
            </div>

            <h3>
              Recovery analysis completed successfully
            </h3>

            <p>
              {statistics.sectorsAnalyzed.toLocaleString()}
              {" "}bytes/sectors processed by the
              read-only C++ recovery engine.
            </p>

          </div>

          <div className="block-status">

            <span className="status-dot green" />

            C++ ENGINE • READ ONLY

          </div>

        </div>
      )}


      <div className="panel">

        <div className="panel-heading">

          <div>

            <div className="eyebrow">
              RECOVERY RESULTS
            </div>

            <h3>
              Recovered File Candidates
            </h3>

          </div>

          <button
            className="secondary-button"
            onClick={() =>
              alert(
                "Recovery report export will be connected to the backend in the next stage."
              )
            }
          >
            <Download size={16} />
            Export Report
          </button>

        </div>


        <div className="filter-bar">

          {[
            "All",
            "JPEG",
            "PDF",
            "DOCX",
            "SQLite",
          ].map((item) => (

            <button
              key={item}
              className={
                filter === item
                  ? "filter active"
                  : "filter"
              }
              onClick={() =>
                setFilter(item)
              }
            >
              {item}
            </button>

          ))}

        </div>


        <div className="recovery-list">

          {filteredFiles.length === 0 ? (

            <div
              style={{
                padding: "30px",
                textAlign: "center",
                color: "var(--muted)",
              }}
            >
              No recovery candidates found.
            </div>

          ) : (

            filteredFiles.map((file, index) => {

              const Icon =
                file.icon ||
                getFileIcon(file.type);

              return (

                <div
                  className="recovery-row"
                  key={
                    `${file.name}-${index}`
                  }
                >

                  <div className="file-icon">
                    <Icon size={19} />
                  </div>


                  <div className="file-name">

                    <strong>
                      {file.name}
                    </strong>

                    <span>
                      {file.type} • {file.size}

                      {file.offset !== null &&
                        file.offset !== undefined
                        ? ` • Offset ${file.offset}`
                        : ""}
                    </span>

                  </div>


                  <div className="score">

                    <span>
                      RECOVERABILITY
                    </span>

                    <strong>
                      {file.recovery}%
                    </strong>

                    <div className="tiny-progress">

                      <div
                        style={{
                          width:
                            `${file.recovery}%`,
                        }}
                      />

                    </div>

                  </div>


                  <div className="score">

                    <span>
                      AI RELEVANCE
                    </span>

                    <strong>
                      {file.relevance}%
                    </strong>

                    <div className="tiny-progress">

                      <div
                        style={{
                          width:
                            `${file.relevance}%`,
                        }}
                      />

                    </div>

                  </div>


                  <span
                    className={`file-status ${
                      (file.status || "Recoverable")
                        .toLowerCase()
                    }`}
                  >
                    {file.status}
                  </span>


                  <button
                    className="icon-button"
                    title={`Inspect ${file.name}`}
                    onClick={() =>
                      alert(
                        [
                          `File: ${file.name}`,
                          `Type: ${file.type}`,
                          `Size: ${file.size}`,
                          `Recoverability: ${file.recovery}%`,
                          `AI relevance: ${file.relevance}%`,
                          file.offset !== null &&
                          file.offset !== undefined
                            ? `Offset: ${file.offset}`
                            : null,
                          file.sha256
                            ? `SHA-256: ${file.sha256}`
                            : null,
                        ]
                          .filter(Boolean)
                          .join("\n")
                      )
                    }
                  >
                    <Eye size={17} />
                  </button>

                </div>
              );
            })

          )}

        </div>

      </div>


      <div className="warning-box">

        <AlertTriangle size={21} />

        <div>

          <strong>
            Safe read-only analysis mode
          </strong>

          <p>
            The C++ recovery engine is connected to the
            controlled test image. Physical disk access is
            disabled and the source image is never modified.
          </p>

        </div>

      </div>

    </>
  );
}

/* =========================================================
   ERASURE CONSOLE
========================================================= */

function ErasureConsole() {
  const [method, setMethod] = useState(
    "NIST 800-88 Clear"
  );

  const [running, setRunning] =
    useState(false);

  const [progress, setProgress] =
    useState(0);

  const [verified, setVerified] =
    useState(false);

  const [error, setError] =
    useState("");

  const [result, setResult] =
    useState(null);


  // ----------------------------------------------------------
  // UI METHOD -> SAFE C++ ENGINE METHOD
  // ----------------------------------------------------------

  function getBackendMethod(selectedMethod) {

    if (
      selectedMethod ===
      "Random Overwrite"
    ) {
      return "random";
    }

    if (
      selectedMethod ===
      "DoD 5220.22-M"
    ) {
      return "three";
    }

    if (
      selectedMethod ===
      "Gutmann 35-Pass"
    ) {
      return "three";
    }

    // NIST 800-88 Clear prototype
    // maps to the engine's single zero pass.
    return "zero";
  }


  async function startErase() {

    if (running) return;


    // --------------------------------------------------------
    // RESET
    // --------------------------------------------------------

    setRunning(true);
    setVerified(false);
    setProgress(0);
    setError("");
    setResult(null);


    const backendMethod =
      getBackendMethod(method);


    // --------------------------------------------------------
    // VISUAL PROGRESS
    // --------------------------------------------------------
    //
    // The C++ engine currently returns a final result rather
    // than streaming progress. The UI therefore advances
    // visually to 90% while waiting for the backend.
    // --------------------------------------------------------

    let value = 0;

    const interval =
      setInterval(() => {

        value =
          Math.min(
            value + 5,
            90
          );

        setProgress(value);

      }, 120);


    try {

      const response =
        await fetch(
          `${API_URL}/erasure/start`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                method:
                  backendMethod,
              }),
          }
        );


      const data =
        await response.json();


      if (!response.ok || !data.success) {

        throw new Error(
          data.message ||
          data.error ||
          `Erasure request failed (${response.status})`
        );
      }


      // ------------------------------------------------------
      // SUCCESS
      // ------------------------------------------------------

      setResult(data);

      setProgress(100);

      setVerified(
        data.verification === "PASS"
      );

    }

    catch (err) {

      console.error(
        "Erasure API error:",
        err
      );

      setError(
        err.message ||
        "Unable to connect to the erasure service."
      );

      setProgress(0);

      setVerified(false);

    }

    finally {

      clearInterval(interval);

      setRunning(false);
    }
  }


  return (
    <>
      <PageHeading
        eyebrow="SECURE SANITIZATION"
        title="Erasure Console"
        description="Execute and verify the controlled C++ test-image sanitization workflow."
      />


      <div className="erasure-grid">


        {/* ==================================================
            TARGET + METHOD
        ================================================== */}

        <div className="panel">

          <div className="panel-heading">

            <div>

              <div className="eyebrow">
                SAFE TARGET
              </div>

              <h3>
                Authorized Test Image
              </h3>

            </div>

            <ShieldCheck size={21} />

          </div>


          <div className="target-card">

            <div className="target-icon">
              <HardDrive size={26} />
            </div>

            <div>

              <strong>
                erase_test_image.bin
              </strong>

              <span>
                TEST IMAGE • core/testdata
              </span>

            </div>

            <span className="target-ready">
              SAFE
            </span>

          </div>


          <div className="method-section">

            <label>
              ERASURE METHOD
            </label>


            {[
              "NIST 800-88 Clear",
              "Random Overwrite",
              "DoD 5220.22-M",
              "Gutmann 35-Pass",
            ].map((item) => (

              <button
                key={item}
                type="button"
                className={`method-option ${
                  method === item
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  !running &&
                  setMethod(item)
                }
                disabled={running}
              >

                <div className="method-radio">

                  {method === item && (
                    <span />
                  )}

                </div>

                <div>

                  <strong>
                    {item}
                  </strong>

                  <span>

                    {item ===
                    "NIST 800-88 Clear"
                      ? "Prototype mapping: single-pass zero"
                      : item ===
                        "Random Overwrite"
                      ? "C++ single-pass random"
                      : "Prototype mapping: three-pass demonstration"}

                  </span>

                </div>

              </button>

            ))}

          </div>


          <div className="destructive-warning">

            <AlertTriangle size={20} />

            <div>

              <strong>
                Controlled destructive test
              </strong>

              <p>
                Only the disposable test image is modified.
                Physical disk access is disabled by the
                C++ engine and backend safety boundary.
              </p>

            </div>

          </div>


          {error && (

            <div className="warning-box">

              <AlertTriangle size={19} />

              <div>

                <strong>
                  Erasure Service Error
                </strong>

                <p>
                  {error}
                </p>

              </div>

            </div>

          )}


          <button
            className="erase-button"
            onClick={startErase}
            disabled={running}
          >

            {running ? (

              <>
                <RefreshCw
                  className="spin"
                  size={18}
                />

                Sanitization Running...
              </>

            ) : (

              <>
                <Trash2 size={18} />

                Start Secure Erasure
              </>

            )}

          </button>

        </div>


        {/* ==================================================
            MONITOR
        ================================================== */}

        <div className="panel erase-monitor">

          <div className="panel-heading">

            <div>

              <div className="eyebrow">
                C++ ENGINE
              </div>

              <h3>
                Sanitization Monitor
              </h3>

            </div>

            <span
              className={
                verified
                  ? "verified-badge"
                  : "monitor-badge"
              }
            >

              {running
                ? "RUNNING"
                : verified
                ? "VERIFIED"
                : "READY"}

            </span>

          </div>


          <div className="sector-grid-large">

            {Array.from(
              { length: 144 },
              (_, i) => (

                <div
                  key={i}
                  className={`sector-block ${
                    i <
                    (progress / 100) *
                      144
                      ? "processed"
                      : i % 17 === 0
                      ? "attention"
                      : ""
                  }`}
                />

              )
            )}

          </div>


          <div className="erase-progress">

            <div className="progress-header">

              <span>

                {running
                  ? "C++ engine executing"
                  : verified
                  ? "Verification completed"
                  : "Ready for safe test-image operation"}

              </span>

              <strong>
                {progress}%
              </strong>

            </div>


            <div className="progress-bar">

              <div
                style={{
                  width:
                    `${progress}%`,
                }}
              />

            </div>

          </div>


          <div className="monitor-stats">

            <div>

              <span>
                METHOD
              </span>

              <strong>
                {method}
              </strong>

            </div>


            <div>

              <span>
                ENGINE
              </span>

              <strong>
                C++
              </strong>

            </div>


            <div>

              <span>
                VERIFICATION
              </span>

              <strong>
                {verified
                  ? "PASS"
                  : "PENDING"}
              </strong>

            </div>

          </div>


          {/* =================================================
              HASH RESULTS
          ================================================= */}

          {result && (

            <div
              style={{
                marginTop: "20px",
                display: "grid",
                gap: "12px",
              }}
            >

              <div
                className="blockchain-panel"
                style={{
                  margin: 0,
                }}
              >

                <div className="blockchain-icon">
                  <ShieldCheck size={22} />
                </div>

                <div
                  style={{
                    minWidth: 0,
                  }}
                >

                  <div className="eyebrow">
                    BEFORE SHA-256
                  </div>

                  <code
                    style={{
                      wordBreak:
                        "break-all",
                      fontSize:
                        "12px",
                    }}
                  >
                    {result.beforeHash ||
                      "Unavailable"}
                  </code>

                </div>

              </div>


              <div
                className="blockchain-panel"
                style={{
                  margin: 0,
                }}
              >

                <div className="blockchain-icon">
                  <CheckCircle2 size={22} />
                </div>

                <div
                  style={{
                    minWidth: 0,
                  }}
                >

                  <div className="eyebrow">
                    AFTER SHA-256
                  </div>

                  <code
                    style={{
                      wordBreak:
                        "break-all",
                      fontSize:
                        "12px",
                    }}
                  >
                    {result.afterHash ||
                      "Unavailable"}
                  </code>

                </div>

              </div>


              <div
                className="blockchain-panel"
                style={{
                  margin: 0,
                }}
              >

                <div className="blockchain-icon">
                  {verified
                    ? <CheckCircle2 size={22} />
                    : <AlertTriangle size={22} />}
                </div>

                <div>

                  <div className="eyebrow">
                    VERIFICATION
                  </div>

                  <h3>
                    {result.verification ||
                      "UNKNOWN"}
                  </h3>

                  <p>
                    {result.status ||
                      "Verification result unavailable."}
                  </p>

                </div>

              </div>


              <div
                style={{
                  fontSize: "12px",
                  color: "var(--muted)",
                  lineHeight: 1.7,
                }}
              >

                <strong>
                  Safety:
                </strong>

                {" "}
                Physical disk access disabled •
                Test image only •
                C++ engine •
                Audit record:{" "}

                {result.auditLogCreated
                  ? "CREATED"
                  : "NOT CREATED"}

              </div>

            </div>

          )}

        </div>

      </div>


      {/* ==================================================
          SAFETY NOTICE
      ================================================== */}

      <div className="warning-box">

        <ShieldCheck size={21} />

        <div>

          <strong>
            C++ test-image safety boundary enabled
          </strong>

          <p>
            The Erasure Console is connected to the C++
            erasure engine through the Node.js backend.
            The backend accepts only the controlled
            erase_test_image.bin inside core/testdata.
            Physical disk access is disabled.
          </p>

        </div>

      </div>

    </>
  );
}

/* =========================================================
   AUDIT & CERTIFICATES
========================================================= */

function BlockchainLedger() {
  const [ledger, setLedger] = useState(null);
  const [verification, setVerification] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadBlockchainData = async () => {
    try {
      setLoading(true);

      const [ledgerRes, verifyRes, certRes] = await Promise.all([
        fetch(`${API_URL}/blockchain/ledger`),
        fetch(`${API_URL}/blockchain/verify`),
        fetch(`${API_URL}/certificates`),
      ]);

      const ledgerData = await ledgerRes.json();
      const verifyData = await verifyRes.json();
      const certData = await certRes.json();

      setLedger(ledgerData);
      setVerification(verifyData);

      if (Array.isArray(certData)) {
        setCertificates(certData);
      } else if (Array.isArray(certData.certificates)) {
        setCertificates(certData.certificates);
      } else {
        setCertificates([]);
      }
    } catch (error) {
      console.error(error);
      setMessage("Unable to connect to blockchain service.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlockchainData();
  }, []);

 const verifyBlockchain = async () => {
  try {
    setMessage("Verifying blockchain integrity...");

    const response = await fetch(
      `${API_URL}/blockchain/verify`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    console.log("Blockchain verification:", data);

    setVerification(data);

    if (data.valid === true) {
      setMessage(
        `✓ Blockchain integrity verified — ${data.checkedBlocks} blocks checked.`
      );
    } else {
      setMessage(
        `✗ Blockchain integrity verification failed.`
      );
    }

    // Refresh the ledger after verification
    const ledgerResponse = await fetch(
      `${API_URL}/blockchain/ledger`,
      {
        cache: "no-store",
      }
    );

    if (ledgerResponse.ok) {
      const ledgerData = await ledgerResponse.json();
      setLedger(ledgerData);
    }

  } catch (error) {
    console.error(
      "Blockchain verification error:",
      error
    );

    setMessage(
      `Blockchain verification failed: ${error.message}`
    );
  }
};

  const anchorCertificate = async () => {
    if (!certificates.length) {
      setMessage("No certificate available for anchoring.");
      return;
    }

    const certificate = certificates[certificates.length - 1];

    if (!certificate) {
      setMessage("No certificate is available for anchoring.");
      return;
    }
    try {
      setMessage("Anchoring certificate...");

      const response = await fetch(
        `${API_URL}/blockchain/anchor`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            certificateId:
              certificate.certificateId ||
              certificate.id,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("Certificate successfully anchored.");
        await loadBlockchainData();
      } else {
        setMessage(
          data.message || "Certificate anchoring failed."
        );
      }
    } catch (error) {
      console.error(error);
      setMessage("Certificate anchoring failed.");
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="panel">
          <div className="panel-title">
            <Network size={20} />
            Blockchain Audit Ledger
          </div>

          <div className="loading-state">
            Loading blockchain ledger...
          </div>
        </div>
      </div>
    );
  }

  const blocks = ledger?.blocks || [];

  return (
    <div className="page-container">

      <div className="page-header">
        <div>
          <h1>Blockchain Audit Ledger</h1>
          <p>
            Tamper-evident audit trail for SecureWipe-Forensics
          </p>
        </div>

        <div className="status-badge">
          <span className="status-dot"></span>
          TESTNET ACTIVE
        </div>
      </div>

      {message && (
        <div className="info-message">
          {message}
        </div>
      )}

      {/* NETWORK OVERVIEW */}

      <div className="dashboard-grid">

        <div className="stat-card">
          <div className="stat-icon">
            <Network size={22} />
          </div>

          <div>
            <div className="stat-label">
              Network
            </div>

            <div className="stat-value">
              SecureWipe-Forensics
            </div>

            <div className="stat-subtext">
              Local Blockchain Testnet
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <ShieldCheck size={22} />
          </div>

          <div>
            <div className="stat-label">
              Integrity
            </div>

            <div className="stat-value">
              {verification?.valid ? "VALID" : "FAILED"}
            </div>

            <div className="stat-subtext">
              {verification?.checkedBlocks || 0} blocks checked
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Database size={22} />
          </div>

          <div>
            <div className="stat-label">
              Blocks
            </div>

            <div className="stat-value">
              {blocks.length}
            </div>

            <div className="stat-subtext">
              Immutable audit records
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FileCheck size={22} />
          </div>

          <div>
            <div className="stat-label">
              Certificates
            </div>

            <div className="stat-value">
              {certificates.length}
            </div>

            <div className="stat-subtext">
              Digital certificates
            </div>
          </div>
        </div>

      </div>

      {/* ACTIONS */}

      <div className="panel">

        <div className="panel-header">
          <div>
            <div className="panel-title">
              <ShieldCheck size={20} />
              Blockchain Controls
            </div>

            <div className="panel-description">
              Verify the audit chain or anchor a certificate hash.
            </div>
          </div>

          <div className="button-group">
<button
  type="button"
  className="secondary-button"
  onClick={async () => {
    try {
      setMessage("Verifying blockchain integrity...");

      const response = await fetch(
        `${API_URL}/blockchain/verify`
      );

      const data = await response.json();

      console.log("VERIFY RESULT:", data);

      setVerification(data);

      if (data.valid === true) {
        setMessage(
          `✓ Blockchain integrity verified — ${data.checkedBlocks} blocks checked.`
        );
      } else {
        setMessage("✗ Blockchain integrity verification failed.");
      }
    } catch (error) {
      console.error("VERIFY ERROR:", error);

      setMessage(
        `Blockchain verification failed: ${error.message}`
      );
    }
  }}
>
  <ShieldCheck size={17} />
  Verify Blockchain
</button>

            <button
              className="primary-button"
              onClick={anchorCertificate}
            >
              <Link2 size={17} />
              Anchor Certificate
            </button>

          </div>
        </div>

      </div>

      {/* LATEST BLOCK */}

      {blocks.length > 0 && (
        <div className="panel">

          <div className="panel-title">
            <Box size={20} />
            Latest Block
          </div>

          <div className="block-details">

            <div>
              <span>Block Index</span>
              <strong>
                {blocks[blocks.length - 1].index}
              </strong>
            </div>

            <div>
              <span>Transaction ID</span>
              <strong>
                {blocks[blocks.length - 1].transactionId || "GENESIS"}
              </strong>
            </div>

            <div>
              <span>Timestamp</span>
              <strong>
                {blocks[blocks.length - 1].timestamp}
              </strong>
            </div>

            <div>
              <span>Previous Hash</span>
              <strong className="hash-text">
                {blocks[blocks.length - 1].previousHash}
              </strong>
            </div>

            <div>
              <span>Block Hash</span>
              <strong className="hash-text">
                {blocks[blocks.length - 1].hash}
              </strong>
            </div>

          </div>

        </div>
      )}

      {/* LEDGER TABLE */}

      <div className="panel">

        <div className="panel-title">
          <Database size={20} />
          Ledger Blocks
        </div>

        <div className="table-wrapper">

          <table className="data-table">

            <thead>
              <tr>
                <th>Block</th>
                <th>Transaction</th>
                <th>Timestamp</th>
                <th>Previous Hash</th>
                <th>Block Hash</th>
              </tr>
            </thead>

            <tbody>

              {blocks.map((block) => (

                <tr key={block.index}>

                  <td>
                    #{block.index}
                  </td>

                  <td>
                    {block.transactionId || "GENESIS"}
                  </td>

                  <td>
                    {block.timestamp}
                  </td>

                  <td>
                    <span className="hash-short">
                      {block.previousHash
                        ? `${block.previousHash.substring(0, 18)}...`
                        : "-"}
                    </span>
                  </td>

                  <td>
                    <span className="hash-short">
                      {block.hash
                        ? `${block.hash.substring(0, 18)}...`
                        : "-"}
                    </span>
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

      {/* SECURITY INFORMATION */}

      <div className="panel security-info">

        <div className="panel-title">
          <Lock size={20} />
          Audit Security Model
        </div>

        <div className="security-grid">

          <div>
            <strong>SHA-256 Hash Chain</strong>
            <span>
              Every block is cryptographically linked to the
              previous block.
            </span>
          </div>

          <div>
            <strong>Tamper Detection</strong>
            <span>
              Modified audit records cause blockchain
              verification to fail.
            </span>
          </div>

          <div>
            <strong>Certificate Anchoring</strong>
            <span>
              Certificate hashes can be permanently recorded
              in the audit ledger.
            </span>
          </div>

          <div>
            <strong>Forensic Traceability</strong>
            <span>
              Each operation can be connected to a timestamp,
              certificate and audit transaction.
            </span>
          </div>

        </div>

      </div>

    </div>
  );
}

function AuditCertificates() {
  const [auditRecords, setAuditRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [generatingCertificate, setGeneratingCertificate] = useState(false);
const [generatedCertificate, setGeneratedCertificate] = useState(null);
const [certificateError, setCertificateError] = useState("");

  const loadAuditRecords = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/audit`);

      if (!response.ok) {
        throw new Error("Failed to load audit records");
      }

      const data = await response.json();

      setAuditRecords(data.records || []);
    } catch (err) {
      console.error(err);
      setError("Unable to connect to forensic audit service.");
    } finally {
      setLoading(false);
    }
  };

  const generateCertificate = async () => {
  try {
    setGeneratingCertificate(true);
    setCertificateError("");
    setGeneratedCertificate(null);

    const response = await fetch(
      `${API_URL}/certificates/generate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || "Failed to generate forensic certificate"
      );
    }

    setGeneratedCertificate(data.certificate);
  } catch (err) {
    console.error(err);
    setCertificateError(
      err.message || "Unable to generate forensic certificate."
    );
  } finally {
    setGeneratingCertificate(false);
  }
}; 

  useEffect(() => {
    loadAuditRecords();
  }, []);

  return (
    <div className="page-content">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Audit & Certificates</h1>
          <p>
            Tamper-evident forensic activity records and sanitization evidence
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
  <button
    className="primary-button"
    onClick={loadAuditRecords}
    disabled={loading}
  >
    ↻ Refresh Audit
  </button>

  <button
    className="primary-button"
    onClick={generateCertificate}
    disabled={generatingCertificate}
  >
    {generatingCertificate
      ? "Generating..."
      : "Generate Forensic Certificate"}
  </button>
</div>
      </div>

{certificateError && (
  <div
    style={{
      marginTop: "20px",
      padding: "18px",
      borderRadius: "14px",
      border: "1px solid rgba(255, 80, 80, 0.35)",
      background: "rgba(255, 60, 60, 0.08)",
      color: "#ff7b7b",
    }}
  >
    <strong>Certificate Generation Failed</strong>
    <div style={{ marginTop: "6px" }}>
      {certificateError}
    </div>
  </div>
)}

{generatedCertificate && (
  <div
    style={{
      marginTop: "20px",
      padding: "22px",
      borderRadius: "16px",
      border: "1px solid rgba(0, 220, 255, 0.35)",
      background: "rgba(0, 180, 255, 0.06)",
    }}
  >
    <h2>✓ Forensic Certificate Generated</h2>

    <p>
      Certificate ID:{" "}
      <strong>{generatedCertificate.certificateId}</strong>
    </p>

    <p>
      Target: <strong>{generatedCertificate.target}</strong>
    </p>

    <p>
      Verification:{" "}
      <strong>{generatedCertificate.verification}</strong>
    </p>

    <p>
      Digital Signature:{" "}
      <strong>
        {generatedCertificate.signatureStatus || "VALID"}
      </strong>
    </p>

    <p>
      Audit Chain:{" "}
      <strong>
        {generatedCertificate.auditChainStatus || "VERIFIED"}
      </strong>
    </p>

    <p>
      Blockchain:{" "}
      <strong>
        {generatedCertificate.blockchainStatus ||
          generatedCertificate.blockchain?.status ||
          "READY"}
      </strong>
    </p>

    <p>Certificate SHA-256:</p>

    <div
      style={{
        padding: "12px",
        borderRadius: "10px",
        background: "rgba(0,0,0,0.25)",
        fontFamily: "monospace",
        fontSize: "12px",
        wordBreak: "break-all",
      }}
    >
      {generatedCertificate.certificateHash}
    </div>

    <div
      style={{
        marginTop: "18px",
        display: "flex",
        gap: "10px",
        flexWrap: "wrap",
      }}
    >
      <button
        className="primary-button"
        onClick={() =>
          window.open(
            `${API_URL}/certificates/${generatedCertificate.certificateId}/download`,
            "_blank"
          )
        }
      >
        Download Forensic Certificate
      </button>

      <button
        className="primary-button"
        onClick={() =>
          window.open(
            `${API_URL}/certificates/${generatedCertificate.certificateId}/verify`,
            "_blank"
          )
        }
      >
        Verify Certificate
      </button>
    </div>
  </div>
)}

{/* System Status */}
<div className="stats-grid">

        <div className="stat-card">
          <div className="stat-icon">▣</div>
          <div>
            <span>Total Records</span>
            <strong>{auditRecords.length}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✓</div>
          <div>
            <span>Verified</span>
            <strong>
  {
    auditRecords.filter(record => {
      const verification = String(
        record.verification || ""
      ).toUpperCase();

      const status = String(
        record.status || ""
      ).toUpperCase();

      return (
        verification === "PASS" ||
        status === "SUCCESS" ||
        status === "TEST IMAGE SANITIZED"
      );
    }).length
  }
</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔐</div>
          <div>
            <span>Security</span>
            <strong>ACTIVE</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">◈</div>
          <div>
            <span>Audit Mode</span>
            <strong>FORENSIC</strong>
          </div>
        </div>

      </div>

      {/* Loading */}
      {loading && (
        <div className="empty-state">
          <div className="loading-spinner"></div>
          <p>Loading forensic audit records...</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="error-panel">
          <strong>Audit Service Error</strong>
          <p>{error}</p>

          <button
            className="secondary-button"
            onClick={loadAuditRecords}
          >
            Retry
          </button>
        </div>
      )}

      {/* Audit Table */}
      {!loading && !error && (
        <div className="panel">

          <div className="panel-header">
            <div>
              <h2>Forensic Audit Trail</h2>
              <p>
                Cryptographically recorded security operations
              </p>
            </div>

            <span className="status-badge success">
              ● LIVE
            </span>
          </div>

          {auditRecords.length === 0 ? (
            <div className="empty-state">
              <h3>No audit records found</h3>
              <p>
                Perform a test-image sanitization operation to create
                an audit record.
              </p>
            </div>
          ) : (
            <div className="table-container">

              <table className="data-table">

                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Operator</th>
                    <th>Action</th>
                    <th>Target</th>
                    <th>Method</th>
                    <th>Verification</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>

                  {auditRecords.map((record, index) => (

                    <tr key={record.id || index}>

                      <td>
                        <span className="record-id">
                          {record.id || `AUDIT-${index + 1}`}
                        </span>
                      </td>

                      <td>
                        {record.operator || "system"}
                      </td>

                      <td>
                        {record.action || "ERASURE"}
                      </td>

                      <td>
                        <span className="target-name">
                          {record.target || "TEST IMAGE"}
                        </span>
                      </td>

                      <td>
                        {record.method || "N/A"}
                      </td>

                      <td>
  {(() => {
    const verification = String(
      record.verification || "N/A"
    ).trim().toUpperCase();

    if (verification === "PASS") {
      return (
        <span className="status-badge success">
          ✓ PASS
        </span>
      );
    }

    if (
      verification === "N/A" ||
      verification === "NA" ||
      verification === ""
    ) {
      return (
        <span
          className="status-badge"
          style={{
            color: "#8da4b8",
            borderColor: "rgba(141, 164, 184, 0.3)",
            background: "rgba(141, 164, 184, 0.08)",
          }}
        >
          N/A
        </span>
      );
    }

    return (
      <span className="status-badge danger">
        ✕ FAIL
      </span>
    );
  })()}
</td>
                      <td>

                        <span className="status-badge success">
                          {record.status || "RECORDED"}
                        </span>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>
          )}

        </div>
      )}

      {/* Detailed Record */}
      {!loading && auditRecords.length > 0 && (

        <div className="panel">

          <div className="panel-header">

            <div>
              <h2>Latest Audit Record</h2>
              <p>
                Cryptographic evidence generated by the C++ erasure engine
              </p>
            </div>

            <span className="status-badge success">
              VERIFIED
            </span>

          </div>

          {(() => {

            const record = auditRecords[auditRecords.length - 1];

            return (

              <div className="audit-details">

                <div className="detail-row">
                  <span>Record ID</span>
                  <strong>{record.id || "N/A"}</strong>
                </div>

                <div className="detail-row">
                  <span>Operator</span>
                  <strong>{record.operator || "system"}</strong>
                </div>

                <div className="detail-row">
                  <span>Target</span>
                  <strong>
                    {record.target || "erase_test_image.bin"}
                  </strong>
                </div>

                <div className="detail-row">
                  <span>Method</span>
                  <strong>{record.method || "N/A"}</strong>
                </div>

                <div className="detail-row">
                  <span>File Size</span>
                  <strong>
                    {record.sizeBytes
                      ? `${Number(record.sizeBytes).toLocaleString()} bytes`
                      : "N/A"}
                  </strong>
                </div>

                <div className="detail-row">
                  <span>Before SHA-256</span>
                  <code>
                    {record.beforeHash || "N/A"}
                  </code>
                </div>

                <div className="detail-row">
                  <span>After SHA-256</span>
                  <code>
                    {record.afterHash || "N/A"}
                  </code>
                </div>

                <div className="detail-row">
                  <span>Verification</span>
                  <strong className="text-success">
                    {record.verification || "N/A"}
                  </strong>
                </div>

                <div className="detail-row">
                  <span>Physical Disk Access</span>
                  <strong className="text-success">
                    {record.physicalDiskAccess === false
                      ? "DISABLED"
                      : "N/A"}
                  </strong>
                </div>

                <div className="detail-row">
                  <span>Safety Mode</span>
                  <strong>
                    {record.safetyMode || "TEST IMAGE ONLY"}
                  </strong>
                </div>

                <div className="detail-row">
                  <span>Engine</span>
                  <strong>
                    {record.engine || "C++"}
                  </strong>
                </div>

              </div>

            );

          })()}

        </div>

      )}

    </div>
  );
}
/* =========================================================
   VERIFY CERTIFICATE
========================================================= */

function VerifyCertificate() {

  const [id, setId] = useState("");
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const certificateFromQR = params.get("certificate");

  if (certificateFromQR) {
    setId(certificateFromQR);

    // Automatically verify certificate from QR
    verifyCertificateFromQR(certificateFromQR);
  }
}, []);

  async function verifyCertificateFromQR(certificateId) {
  try {
    setLoading(true);
    setVerification(null);

    const response = await fetch(
      `${API_URL}/certificates/${encodeURIComponent(certificateId)}/verify`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Certificate verification failed"
      );
    }

    setVerification(data);

  } catch (error) {
    setVerification({
      valid: false,
      message: error.message
    });
  } finally {
    setLoading(false);
  }
}

  async function verify(e) {
  e.preventDefault();

  const certificateId = id.trim();

  if (!certificateId) {
    setVerification({
      valid: false,
      message: "Please enter a certificate ID."
    });
    return;
  }

  setLoading(true);
  setVerification(null);

  try {
    const url =
      `${API_URL}/certificates/${encodeURIComponent(certificateId)}/verify`;

    console.log("VERIFY URL:", url);

    const response = await fetch(url);

    console.log("VERIFY STATUS:", response.status);

    const data = await response.json();

    console.log("VERIFY RESPONSE:", data);

    setVerification(data);

  } catch (error) {
    console.error("VERIFY ERROR:", error);

    setVerification({
      valid: false,
      message: `Verification failed: ${error.message}`
    });

  } finally {
    setLoading(false);
  }
}

  const checks =
    verification?.checks || {};

  const certificateValid =
    checks.certificateHash === true;

  const signatureValid =
    checks.digitalSignature === true;

  const blockchainStatus = String(
    verification?.blockchainStatus || ""
  ).toUpperCase();

const blockchainValid =
  checks.auditChain === true &&
  blockchainStatus === "ANCHORED";

  const blockchainAnchored =
    blockchainStatus === "ANCHORED";

  const overallValid =
    verification?.valid === true;

  return (
    <>
      <PageHeading
        eyebrow="PUBLIC VERIFICATION"
        title="Verify Certificate"
        description="Validate a SecureWipe forensic sanitization certificate."
      />

      <div className="verify-layout">

        {/* =================================================
            VERIFICATION FORM
        ================================================= */}

        <div className="panel verify-card">

          <div className="verify-icon">
            <ShieldCheck size={42} />
          </div>

          <div className="eyebrow">
            CERTIFICATE VALIDATION
          </div>

          <h2>Verify a certificate</h2>

          <p>
            Enter the certificate identifier to verify
            its cryptographic authenticity, digital
            signature, audit chain and blockchain status.
          </p>

          <form onSubmit={verify}>

            <div className="input-wrap">

              <BadgeCheck size={18} />

              <input
                value={id}
                onChange={(e) =>
                  setId(e.target.value)
                }
                placeholder="SWF-CERT-2026-0001"
              />

            </div>

            <button
              className="primary-button full"
              type="submit"
              disabled={loading}
            >

              <Search size={17} />

              {loading
                ? "Verifying..."
                : "Verify Certificate"}

            </button>

          </form>

          {/* =================================================
              VERIFICATION RESULT
          ================================================= */}

          {verification && (

            <div
              className={
                overallValid
                  ? "verification-result success"
                  : "verification-result danger"
              }
            >

              {overallValid ? (
                <CheckCircle2 size={26} />
              ) : (
                <AlertTriangle size={26} />
              )}

              <div>

                <strong>
                  {overallValid
                    ? "Certificate Verified"
                    : "Certificate Verification Failed"}
                </strong>

                <span>
                  {overallValid
                    ? blockchainAnchored
                      ? "Cryptographic evidence and blockchain record are valid."
                      : "Cryptographic evidence is valid. Certificate is ready for blockchain anchoring."
                    : (
                        verification.message ||
                        verification.error ||
                        "The certificate could not be verified."
                      )}
                </span>

              </div>

            </div>

          )}

        </div>


        {/* =================================================
            VERIFICATION DETAILS
        ================================================= */}

        {verification && (

          <div className="panel verification-info">

            <div className="panel-heading">

              <div>

                <div className="eyebrow">
                  VALIDATION RESULT
                </div>

                <h3>
                  Certificate Verification
                </h3>

              </div>

              <ShieldCheck size={21} />

            </div>


            {/* =================================================
                CERTIFICATE
            ================================================= */}

            <div className="verification-check">

              <div>

                <span className="verification-label">
                  CERTIFICATE
                </span>

                <strong>
                  {certificateValid
                    ? "VALID"
                    : "INVALID"}
                </strong>

              </div>

              <div
                className={
                  certificateValid
                    ? "verification-status valid"
                    : "verification-status invalid"
                }
              >

                {certificateValid ? (
                  <CheckCircle2 size={20} />
                ) : (
                  <AlertTriangle size={20} />
                )}

              </div>

            </div>


            {/* =================================================
                DIGITAL SIGNATURE
            ================================================= */}

            <div className="verification-check">

              <div>

                <span className="verification-label">
                  DIGITAL SIGNATURE
                </span>

                <strong>
                  {signatureValid
                    ? "VALID"
                    : "INVALID"}
                </strong>

              </div>

              <div
                className={
                  signatureValid
                    ? "verification-status valid"
                    : "verification-status invalid"
                }
              >

                {signatureValid ? (
                  <CheckCircle2 size={20} />
                ) : (
                  <AlertTriangle size={20} />
                )}

              </div>

            </div>


            {/* =================================================
                BLOCKCHAIN
            ================================================= */}

            <div className="verification-check">

              <div>

                <span className="verification-label">
                  BLOCKCHAIN
                </span>

                <strong>
                  {blockchainAnchored
                    ? "VALID"
                    : blockchainValid
                    ? "READY"
                    : "INVALID"}
                </strong>

              </div>

              <div
                className={
                  blockchainValid
                    ? "verification-status valid"
                    : "verification-status invalid"
                }
              >

                {blockchainValid ? (
                  <CheckCircle2 size={20} />
                ) : (
                  <AlertTriangle size={20} />
                )}

              </div>

            </div>


            {/* =================================================
                LEDGER STATUS
            ================================================= */}

            <div className="verification-check">

              <div>

                <span className="verification-label">
                  LEDGER STATUS
                </span>

                <strong>
                  {verification.blockchainStatus ||
                    "NOT ANCHORED"}
                </strong>

              </div>

              <div
                className={
                  ["ANCHORED", "READY_FOR_ANCHORING"].includes(
                    String(verification.blockchainStatus || "").toUpperCase()
                  )
                    ? "verification-status valid"
                    : "verification-status invalid"
                }
              >

                {["ANCHORED", "READY_FOR_ANCHORING"].includes(
                  String(verification.blockchainStatus || "").toUpperCase()
                ) ? (
                  <CheckCircle2 size={20} />
                ) : (
                  <AlertTriangle size={20} />
                )}

              </div>

            </div>


            {/* =================================================
                CERTIFICATE ID
            ================================================= */}

            <div className="verification-meta">

              <div>

                <span>
                  CERTIFICATE ID
                </span>

                <strong>
                  {verification.certificateId ||
                    id}
                </strong>

              </div>


              <div>

                <span>
                  SIGNATURE ALGORITHM
                </span>

                <strong>
                  {verification.signatureAlgorithm ||
                    "RSA-SHA256"}
                </strong>

              </div>


              <div>

                <span>
                  AUDIT CHAIN
                </span>

                <strong>
                  {verification.auditChainMessage ||
                    "Audit chain integrity verified."}
                </strong>

              </div>

            </div>


            {/* =================================================
                HASH INFORMATION
            ================================================= */}

            {verification.storedHash && (

              <div className="verification-hash">

                <div className="eyebrow">
                  CERTIFICATE SHA-256
                </div>

                <code>
                  {verification.storedHash}
                </code>

              </div>

            )}

            {overallValid && (

              <div className="verification-success-message">

                <CheckCircle2 size={18} />

                <span>
                  Certificate verified successfully.
                  {overallValid && verification?.certificateId && (
  <div
    style={{
      marginTop: "18px",
      display: "flex",
      justifyContent: "center",
    }}
  >
    <button
      className="primary-button"
      type="button"
      onClick={() => {
        const certificateId =
          verification.certificateId;

        window.open(
          `${API_URL}/certificates/${encodeURIComponent(
            certificateId
          )}/download`,
          "_blank"
        );
      }}
    >
      <Download size={17} />
      Download Forensic Certificate
    </button>
  </div>
)}
                </span>

              </div>

            )}

          </div>

        )}

      </div>


      {/* =================================================
          VALIDATION PIPELINE
      ================================================= */}

      <div className="panel verification-info">

        <div className="panel-heading">

          <div>

            <div className="eyebrow">
              VALIDATION PIPELINE
            </div>

            <h3>
              Verification Process
            </h3>

          </div>

          <ShieldCheck size={21} />

        </div>


        {[
          [
            "01",
            "Certificate ID",
            "Locate the certificate record"
          ],
          [
            "02",
            "Certificate Hash",
            "Validate SHA-256 certificate integrity"
          ],
          [
            "03",
            "Digital Signature",
            "Validate RSA-SHA256 signature"
          ],
          [
            "04",
            "Audit Chain",
            "Verify cryptographic audit history"
          ],
          [
            "05",
            "Blockchain",
            "Confirm anchored ledger transaction"
          ]
        ].map(
          ([number, title, description]) => (

            <div
              className="verification-step"
              key={number}
            >

              <div className="step-number">
                {number}
              </div>

              <div>

                <strong>
                  {title}
                </strong>

                <span>
                  {description}
                </span>

              </div>

            </div>

          )
        )}

      </div>

    </>
  );
}

/* =========================================================
   BLOCKCHAIN AUDIT LEDGER
========================================================= */


/* =========================================================
   APP
========================================================= */

export default function App() {

  const [authenticated, setAuthenticated] = useState(false);

  const [user, setUser] = useState(null);

  const [activePage, setActivePage] =
    useState("Dashboard");

  const [sidebarOpen, setSidebarOpen] =
    useState(false);
  
    useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const certificateFromQR = params.get("certificate");

    if (certificateFromQR) {
      setActivePage("Verify Certificate");
    }
  }, []);

  const menu = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Device Manager",
      icon: HardDrive,
    },
    {
      name: "Recovery Workspace",
      icon: Search,
    },
    {
      name: "Erasure Console",
      icon: Shield,
    },
    {
      name: "Audit & Certificates",
      icon: FileText,
    },
    {
      name: "Blockchain Ledger",
      icon: Network,
    },
    {
      name: "Verify Certificate",
      icon: BadgeCheck,
    },
  ];

  function login(userData) {

    setUser(userData);
    setAuthenticated(true);
  }

  function logout() {

    setAuthenticated(false);
    setUser(null);
    setActivePage("Dashboard");
  }

  function navigate(page) {

    setActivePage(page);
    setSidebarOpen(false);
  }

  useEffect(() => {

    document.title =
      `SecureWipe Forensics — ${activePage}`;

  }, [activePage]);

  if (!authenticated) {
    return <Login onLogin={login} />;
  }

  return (

    <div className="app-shell">

      <aside
        className={`sidebar ${
          sidebarOpen ? "open" : ""
        }`}
      >

        <div className="sidebar-brand">

          <div className="brand-logo">
            <ShieldCheck size={27} />
          </div>

          <div>
            <h2>
              Secure<span>Wipe</span>
            </h2>

            <p>FORENSICS</p>
          </div>

          <button
            className="mobile-close"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>

        </div>


        <div className="sidebar-label">
          OPERATIONS
        </div>

        <nav>

          {menu.map(({ name, icon: Icon }) => (

            <button
              key={name}
              className={
                activePage === name
                  ? "nav-item active"
                  : "nav-item"
              }
              onClick={() => navigate(name)}
            >

              <Icon size={19} />

              <span>{name}</span>

              {activePage === name && (
                <ChevronRight
                  className="nav-arrow"
                  size={15}
                />
              )}

            </button>

          ))}

        </nav>


        <div className="sidebar-bottom">

          <div className="operator-card">

            <div className="operator-avatar">
              <User size={18} />
            </div>

            <div>

              <strong>{user?.username}</strong>

              <span>{user?.role}</span>

            </div>

            <span className="status-dot green" />

          </div>

          <button className="bottom-item">
            <Settings size={18} />
            Settings
          </button>

          <button
            className="bottom-item logout"
            onClick={logout}
          >
            <LogIn size={18} />
            Sign Out
          </button>

        </div>

      </aside>


      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}


      <main className="main-area">

        <header className="topbar">

          <button
            className="mobile-menu"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={21} />
          </button>

          <div className="topbar-title">

            <span>SECURE FORENSIC OPERATIONS</span>

            <strong>{activePage}</strong>

          </div>

          <div className="topbar-actions">

            <div className="system-online">
              <span className="status-dot green" />
              SYSTEM ONLINE
            </div>

            <div className="topbar-user">
              <div className="top-avatar">
                <User size={16} />
              </div>

              <span>{user?.username}</span>
            </div>

          </div>

        </header>


        <div className="page-content">

          {activePage === "Dashboard" && (
            <Dashboard navigate={navigate} />
          )}

          {activePage === "Device Manager" && (
            <DeviceManager />
          )}

          {activePage === "Recovery Workspace" && (
            <RecoveryWorkspace />
          )}

          {activePage === "Erasure Console" && (
            <ErasureConsole />
          )}

          {activePage === "Audit & Certificates" && (
            <AuditCertificates />
          )}

          {activePage === "Blockchain Ledger" && (
            <BlockchainLedger />
          )}

          {activePage === "Verify Certificate" && (
            <VerifyCertificate />
          )}

        </div>


        <footer className="app-footer">

          <div>
            <ShieldCheck size={15} />
            SecureWipe Forensics
          </div>

          <div>
            AES-256 • SHA-256 • RBAC • AUDIT READY
          </div>

        </footer>

      </main>

    </div>
  );
}
