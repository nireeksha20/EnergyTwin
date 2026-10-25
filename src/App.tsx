import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Award,
  Building2,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Clock,
  Cpu,
  Flame,
  Gauge,
  Info,
  LayoutDashboard,
  Moon,
  Pause,
  Play,
  RefreshCw,
  ShieldCheck,
  Sun,
  Thermometer,
  TrendingUp,
  Wifi,
  WifiOff,
  Zap,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import "./App.css";
import AIInsights from "./components/AIInsights";
import Trends from "./components/Trends";
import DigitalTwin from "./components/DigitalTwin";
import Assets from "./components/Assets";
import CircularGauge from "./components/CircularGauge";
import EnergyTotalizer from "./components/EnergyTotalizer";
import { energyReadings, getEnergyInsights, getEnergySummary } from "./data/energyData";
import { getEnergyReadings } from "./services/energyService";
import type { EnergyReading } from "./data/energyTypes";

type Theme = "dark" | "light";

const navigation = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Trends", icon: TrendingUp },
  { label: "Digital Twin", icon: Building2 },
  { label: "Assets", icon: Cpu },
  { label: "AI Insights", icon: BrainCircuit },
];

export default function App() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [activePage, setActivePage] = useState("Overview");
  const [dataMode, setDataMode] = useState<"simulation" | "hardware">("simulation");
  const [apiReadings, setApiReadings] = useState<EnergyReading[]>([]);
  const [apiError, setApiError] = useState("");
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Simulation playback state (cycles through 8 diurnal steps)
  const [simIndex, setSimIndex] = useState<number>(4); // Default to 12:00 peak
  const [isSimPlaying, setIsSimPlaying] = useState<boolean>(true);

  // Simulation auto-stepper: advances every 4.5s when playing
  useEffect(() => {
    if (dataMode !== "simulation" || !isSimPlaying) return;

    const timer = window.setInterval(() => {
      setSimIndex((prev) => (prev + 1) % energyReadings.length);
      setLastRefreshed(new Date());
    }, 4500);

    return () => window.clearInterval(timer);
  }, [dataMode, isSimPlaying]);

  // Background polling for Express API
  useEffect(() => {
    let cancelled = false;

    async function loadReadings() {
      if (dataMode === "simulation") {
        setApiError("");
        return;
      }

      try {
        const readings = await getEnergyReadings("hardware");
        if (!cancelled) {
          setApiReadings(readings);
          setApiError("");
          setLastRefreshed(new Date());
        }
      } catch {
        if (!cancelled) {
          setApiReadings([]);
          setApiError(
            "Could not load hardware readings. Check that the Express backend is running on port 5000.",
          );
          setLastRefreshed(new Date());
        }
      }
    }

    void loadReadings();

    const intervalId = window.setInterval(() => {
      void loadReadings();
    }, 5000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [dataMode]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (dataMode === "hardware") {
        const readings = await getEnergyReadings("hardware");
        setApiReadings(readings);
        setApiError("");
      }
      setLastRefreshed(new Date());
    } catch {
      setApiReadings([]);
      setApiError(
        "Could not load hardware readings. Check that the Express backend is running on port 5000.",
      );
      setLastRefreshed(new Date());
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  // Determine active telemetry readings for gauges
  const currentSimReading = energyReadings[simIndex];
  const latestHwReading =
    apiReadings.length > 0 ? apiReadings[apiReadings.length - 1] : null;

  // Stale detection for hardware telemetry (inactive > 25 seconds or backend error)
  const isHardwareStale =
    dataMode === "hardware" &&
    (Boolean(apiError) ||
      (latestHwReading !== null &&
        Date.now() - new Date(latestHwReading.timestamp).getTime() > 25000));

  // Gauge values strictly adhering to data availability
  const gaugeVoltage =
    dataMode === "simulation"
      ? currentSimReading.voltage
      : latestHwReading?.voltage ?? null;

  const gaugeCurrent =
    dataMode === "simulation"
      ? currentSimReading.current
      : latestHwReading?.current ?? null;

  const gaugePower =
    dataMode === "simulation"
      ? currentSimReading.power
      : latestHwReading?.power ?? null;

  // Power Factor: strictly null in simulation as it is not metered in the baseline dataset.
  // In hardware mode: populated if provided by hardware packet.
  const gaugePowerFactor =
    dataMode === "simulation"
      ? null
      : (latestHwReading?.powerFactor ?? null);

  // Trapezoidal integration for hardware energy today
  const hardwareEnergyToday = (() => {
    const today = new Date().toDateString();

    const readings = apiReadings
      .filter((reading) => new Date(reading.timestamp).toDateString() === today)
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      );

    if (readings.length < 2) return null;

    return readings.slice(1).reduce((total, reading, index) => {
      const previous = readings[index];

      const hours =
        (new Date(reading.timestamp).getTime() -
          new Date(previous.timestamp).getTime()) /
        3_600_000;

      if (hours <= 0) return total;

      return total + ((previous.power + reading.power) / 2) * hours;
    }, 0);
  })();

  const simulationSummary = getEnergySummary();

  const gaugeEnergy =
    dataMode === "simulation"
      ? simulationSummary.estimatedDailyEnergy
      : hardwareEnergyToday;

  // Chart data
  const displayReadings =
    dataMode === "hardware"
      ? apiReadings.map((reading) => ({
          time: new Date(reading.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          power: reading.power,
          baseline: 0,
          voltage: reading.voltage,
          current: reading.current,
          occupancy: reading.occupancy ?? 0,
        }))
      : energyReadings;

  const peakPowerValue =
    displayReadings.length > 0
      ? Math.max(...displayReadings.map((r) => r.power)).toFixed(2)
      : "—";

  const minPowerValue =
    displayReadings.length > 0
      ? Math.min(...displayReadings.map((r) => r.power)).toFixed(2)
      : "—";

  const avgPowerValue =
    dataMode === "simulation"
      ? simulationSummary.averagePower.toFixed(2)
      : displayReadings.length > 0
        ? (displayReadings.reduce((acc, r) => acc + r.power, 0) / displayReadings.length).toFixed(2)
        : "—";

  const overviewInsights = getEnergyInsights().slice(0, 3);

  return (
    <div className={`app ${theme}`}>
      {/* SIDEBAR NAVIGATION */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <Zap size={24} />
          </div>
          <div className="brand-text">
            <h2>
              EnergyTwin <span>AI</span>
            </h2>
            <p>BUILDING INTELLIGENCE</p>
          </div>
        </div>

        <div className="competition-sidebar-pill">
          <Award size={13} />
          <span>VISHWAKARMA 2026–27</span>
        </div>

        <div className="nav-label">PILOT WORKSPACE</div>
        <nav className="navigation">
          {navigation.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`nav-item ${activePage === label ? "active" : ""}`}
              onClick={() => setActivePage(label)}
            >
              <Icon size={18} />
              <span>{label}</span>
              {activePage === label && <ChevronRight size={14} className="nav-active-arrow" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div
            className={`connection-dot ${
              dataMode === "simulation"
                ? "mode-sim"
                : apiError
                  ? "mode-err"
                  : apiReadings.length > 0
                    ? isHardwareStale
                      ? "mode-wait"
                      : "mode-hw"
                    : "mode-wait"
            }`}
          />
          <div className="sidebar-bottom-info">
            <strong>
              {dataMode === "simulation"
                ? "Simulation Engine"
                : apiError
                  ? "Backend Offline"
                  : isHardwareStale
                    ? "Hardware Stream Stale"
                    : apiReadings.length > 0
                      ? "Hardware Active"
                      : "Awaiting Telemetry"}
            </strong>
            <p>
              {dataMode === "simulation"
                ? `Diurnal step ${simIndex + 1} of 8 (${currentSimReading.time})`
                : apiError
                  ? "Express port 5000"
                  : apiReadings.length > 0
                    ? `${apiReadings.length} packets received`
                    : "Ready for sensor POST"}
            </p>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="main-content">
        {/* TOPBAR HEADER */}
        <header className="topbar">
          <div className="topbar-left">
            <div className="eyebrow-row">
              <span className="eyebrow-badge">VISHWAKARMA AWARDS 2026–27 PILOT</span>
              <span className="eyebrow-sub">MALNAD COLLEGE OF ENGINEERING · MCE HASSAN</span>
            </div>
            <h1>{activePage === "Overview" ? "Building Energy Overview" : activePage}</h1>
            <p className="page-description">
              Mechanical Seminar Hall · Phase 1 Building Energy Digital Twin & Sub-Metering Pilot
            </p>
          </div>

          <div className="topbar-actions">
            {/* Simulation vs Hardware Selector */}
            <div className="data-mode-selector" role="radiogroup" aria-label="Data Source Mode">
              <button
                type="button"
                className={`mode-btn ${dataMode === "simulation" ? "active" : ""}`}
                onClick={() => setDataMode("simulation")}
                title="Use illustrative 24-hour simulation data"
              >
                <span className="mode-indicator sim" />
                Simulation
              </button>
              <button
                type="button"
                className={`mode-btn ${dataMode === "hardware" ? "active" : ""}`}
                onClick={() => setDataMode("hardware")}
                title="Connect to local Express hardware API"
              >
                <span
                  className={`mode-indicator ${
                    apiError
                      ? "err"
                      : apiReadings.length > 0
                        ? isHardwareStale
                          ? "wait"
                          : "live"
                        : "wait"
                  }`}
                />
                Hardware
              </button>
            </div>

            {/* Manual Refresh Button */}
            <button
              className={`icon-button ${isRefreshing ? "spin" : ""}`}
              onClick={handleManualRefresh}
              title={`Last refreshed: ${lastRefreshed.toLocaleTimeString()}`}
              aria-label="Refresh telemetry data"
            >
              <RefreshCw size={17} />
            </button>

            {/* Theme Toggle */}
            <button
              className="icon-button"
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          </div>
        </header>

        {/* PAGE ROUTER */}
        {activePage === "AI Insights" ? (
          <AIInsights dataMode={dataMode} />
        ) : activePage === "Digital Twin" ? (
          <DigitalTwin />
        ) : activePage === "Trends" ? (
          <Trends />
        ) : activePage === "Assets" ? (
          <Assets />
        ) : (
          /* OVERVIEW PAGE */
          <div className="overview-page">
            {/* TRANSPARENCY & DATA SOURCE BANNER */}
            {dataMode === "simulation" ? (
              <div className="transparency-banner banner-simulation">
                <Info size={18} className="banner-icon" />
                <div className="banner-text">
                  <strong>Simulation Mode Active:</strong> Displaying synthetic 24-hour diurnal profile
                  modeled after academic seminar hall usage. The circular gauges animate smoothly as simulated
                  readings update across the diurnal cycle.
                </div>
                <span className="banner-tag">SYNTHETIC DIURNAL PROFILE</span>
              </div>
            ) : apiError ? (
              <div className="transparency-banner banner-error">
                <WifiOff size={18} className="banner-icon" />
                <div className="banner-text">
                  <strong>Hardware API Disconnected:</strong> Could not connect to Express backend at{" "}
                  <code>http://localhost:5000/api/energy/readings</code>. Ensure the backend server is running
                  via <code>cd backend && npm run dev</code>.
                </div>
                <button
                  className="banner-action-btn"
                  onClick={() => setDataMode("simulation")}
                >
                  Return to Simulation
                </button>
              </div>
            ) : apiReadings.length === 0 ? (
              <div className="transparency-banner banner-waiting">
                <Wifi size={18} className="banner-icon" />
                <div className="banner-text">
                  <strong>Express API Connected · Awaiting Telemetry:</strong> Connected to Express backend on
                  port 5000. No hardware readings have been posted yet. Post JSON packets to{" "}
                  <code>/api/energy/readings</code> to stream live telemetry.
                </div>
                <button
                  className="banner-action-btn"
                  onClick={() => setDataMode("simulation")}
                >
                  Switch to Simulation
                </button>
              </div>
            ) : (
              <div className="transparency-banner banner-hardware-live">
                <CheckCircle2 size={18} className="banner-icon" />
                <div className="banner-text">
                  <strong>Hardware Telemetry Active:</strong> Ingesting real-time telemetry from Express API.
                  Received <strong>{apiReadings.length}</strong> True-RMS hardware samples. Circular gauges update
                  strictly from incoming measurements.
                </div>
                <span className="banner-tag live">HARDWARE STREAM</span>
              </div>
            )}

            {/* STALE DATA WARNING BANNER (When hardware stream ceases) */}
            {isHardwareStale && (
              <div className="stale-alert-banner">
                <AlertTriangle size={18} className="stale-icon" />
                <div className="stale-text">
                  <strong>Stale Telemetry Warning:</strong> Hardware readings have stopped arriving. Last
                  reading received at <strong>{lastRefreshed.toLocaleTimeString()}</strong>. Dial needles reflect
                  the last cached frame until new telemetry is received.
                </div>
              </div>
            )}

            {/* PILOT HERO CARD */}
            <section className="overview-hero">
              <div className="hero-content">
                <div className="hero-badge-group">
                  <span className="hero-chip primary">ACADEMIC PILOT ZONE</span>
                  <span className="hero-chip">BUILDING #04 · ROOM MSH-101</span>
                  <span className="hero-chip">415V / 230V 3-PHASE SUB-INCOMER</span>
                </div>
                <h2>Mechanical Seminar Hall Digital Twin</h2>
                <p>
                  High-resolution electrical monitoring, baseline demand tracking, and explainable rule-based
                  diagnostics designed for university campus facilities. Developed for the{" "}
                  <strong>Vishwakarma Awards 2026–27</strong> sustainable infrastructure innovation track.
                </p>

                <div className="hero-specs-row">
                  <div className="hero-spec">
                    <span className="spec-label">Pilot Floor Area</span>
                    <strong className="spec-value">~1,850 sq.ft</strong>
                  </div>
                  <div className="hero-spec-divider" />
                  <div className="hero-spec">
                    <span className="spec-label">Seating Capacity</span>
                    <strong className="spec-value">120 Seats (Tiered)</strong>
                  </div>
                  <div className="hero-spec-divider" />
                  <div className="hero-spec">
                    <span className="spec-label">Primary Load</span>
                    <strong className="spec-value">Dual 2.0 TR Split HVAC</strong>
                  </div>
                  <div className="hero-spec-divider" />
                  <div className="hero-spec">
                    <span className="spec-label">Current Occupancy</span>
                    <strong className="spec-value">
                      {dataMode === "simulation"
                        ? `${currentSimReading.occupancy}% (${currentSimReading.time})`
                        : latestHwReading?.occupancy !== null && latestHwReading?.occupancy !== undefined
                          ? `${latestHwReading.occupancy}%`
                          : "—"}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="hero-telemetry-badge">
                <Building2 size={36} className="hero-building-icon" />
                <div className="telemetry-badge-content">
                  <span className="telemetry-label">Pilot Integration Status</span>
                  <strong>Site Audit Complete</strong>
                  <span className="telemetry-sub">CT Meter Installation Pending</span>
                </div>
              </div>
            </section>

            {/* CIRCULAR ELECTRICAL INSTRUMENT CONSOLE */}
            <section className="electrical-console-panel">
              <div className="console-header">
                <div className="console-title-group">
                  <div className="console-icon-badge">
                    <Gauge size={20} />
                  </div>
                  <div>
                    <div className="console-eyebrow">SUB-DISTRIBUTION INCOMER · DB-MSH-01</div>
                    <h3 className="console-title">Electrical Instrument Console</h3>
                  </div>
                </div>

                <div className="console-meta-info">
                  <span className="console-timestamp">
                    <Clock size={13} />
                    Last update: {lastRefreshed.toLocaleTimeString()}
                  </span>
                  <span
                    className={`console-stream-pill ${
                      dataMode === "simulation"
                        ? "pill-sim"
                        : isHardwareStale
                          ? "pill-stale"
                          : apiReadings.length > 0
                            ? "pill-live"
                            : "pill-wait"
                    }`}
                  >
                    <span className="stream-pulse-dot" />
                    {dataMode === "simulation"
                      ? "SIMULATED TELEMETRY"
                      : isHardwareStale
                        ? "STALE STREAM"
                        : apiReadings.length > 0
                          ? "LIVE HARDWARE STREAM"
                          : "AWAITING SENSORS"}
                  </span>
                </div>
              </div>

              {/* Simulation Stepper Controller (Active in Simulation mode) */}
              {dataMode === "simulation" && (
                <div className="sim-controller-bar">
                  <div className="sim-controller-left">
                    <button
                      className="sim-play-btn"
                      onClick={() => setIsSimPlaying(!isSimPlaying)}
                      title={isSimPlaying ? "Pause simulation auto-step" : "Resume simulation auto-step"}
                    >
                      {isSimPlaying ? <Pause size={14} /> : <Play size={14} />}
                      <span>{isSimPlaying ? "Pause" : "Play Cycle"}</span>
                    </button>
                    <span className="sim-stepper-label">Diurnal Timeline Stepper:</span>
                  </div>

                  <div className="sim-pills-row">
                    {energyReadings.map((reading, idx) => (
                      <button
                        key={reading.time}
                        className={`sim-time-pill ${idx === simIndex ? "active" : ""}`}
                        onClick={() => {
                          setSimIndex(idx);
                          setLastRefreshed(new Date());
                        }}
                      >
                        {reading.time}
                        {idx === simIndex && <span className="active-dot" />}
                      </button>
                    ))}
                  </div>

                  <div className="sim-current-summary">
                    <span>
                      Active: <strong>{currentSimReading.time}</strong> ({currentSimReading.power} kW vs{" "}
                      {currentSimReading.baseline} kW baseline)
                    </span>
                  </div>
                </div>
              )}

              {/* Grid of 4 Circular Gauges + 1 Cumulative Energy Totalizer */}
              <div className="gauges-grid">
                {/* 1. Circular Voltmeter */}
                <CircularGauge
                  id="gauge-voltmeter"
                  label="AC VOLTMETER"
                  sublabel="Phase Voltage (L-N)"
                  unit="V"
                  value={gaugeVoltage}
                  min={0}
                  max={300}
                  majorTicks={[0, 50, 100, 150, 200, 250, 300]}
                  nominalRange={[216, 244]}
                  warningRange={[207, 253]}
                  dangerRange={[253, 300]}
                  dataMode={dataMode}
                  isStale={isHardwareStale}
                  precision={1}
                  nominalNote="Nominal grid band: 216–244 V (230V ± 6%)"
                />

                {/* 2. Circular Ammeter */}
                <CircularGauge
                  id="gauge-ammeter"
                  label="AC AMMETER"
                  sublabel="Feeder Load Current"
                  unit="A"
                  value={gaugeCurrent}
                  min={0}
                  max={30}
                  majorTicks={[0, 5, 10, 15, 20, 25, 30]}
                  nominalRange={[0, 18]}
                  warningRange={[18, 24]}
                  dangerRange={[24, 30]}
                  dataMode={dataMode}
                  isStale={isHardwareStale}
                  precision={1}
                  nominalNote="Feeder nominal: 0–18 A (63A MCB protection)"
                />

                {/* 3. Circular Power Meter */}
                <CircularGauge
                  id="gauge-power"
                  label="ACTIVE POWER"
                  sublabel="Instantaneous Load"
                  unit="kW"
                  value={gaugePower}
                  min={0}
                  max={10}
                  majorTicks={[0, 2, 4, 6, 8, 10]}
                  nominalRange={[0, 4.5]}
                  warningRange={[4.5, 7.5]}
                  dangerRange={[7.5, 10]}
                  dataMode={dataMode}
                  isStale={isHardwareStale}
                  precision={2}
                  nominalNote="Base load: < 4.5 kW · Peak capacity: 10 kW"
                />

                {/* 4. Circular Power Factor Indicator */}
                <CircularGauge
                  id="gauge-pf"
                  label="POWER FACTOR"
                  sublabel="cos φ (Phase Alignment)"
                  unit="cos φ"
                  value={gaugePowerFactor}
                  min={0}
                  max={1.0}
                  majorTicks={[0.0, 0.2, 0.4, 0.6, 0.8, 1.0]}
                  nominalRange={[0.90, 1.00]}
                  warningRange={[0.80, 0.90]}
                  dangerRange={[0.0, 0.80]}
                  dataMode={dataMode}
                  isStale={isHardwareStale}
                  precision={2}
                  unavailableNote={
                    dataMode === "simulation"
                      ? "Measurement unavailable (PF not metered in simulation dataset)"
                      : "Measurement unavailable (Awaiting meter PF register)"
                  }
                  nominalNote="High efficiency target: 0.90–1.00 cos φ"
                />

                {/* 5. Cumulative Energy Totalizer */}
                <EnergyTotalizer
                  value={gaugeEnergy}
                  dataMode={dataMode}
                  isStale={isHardwareStale}
                  unavailableNote={
                    dataMode === "simulation"
                      ? "Simulation energy available"
                      : "Requires ≥ 2 readings today"
                  }
                  contextNote={
                    dataMode === "simulation"
                      ? "24h diurnal trapezoidal sum (78.90 kWh)"
                      : "Today's trapezoidal energy integral"
                  }
                />
              </div>
            </section>

            {/* INTERACTIVE CONSUMPTION CHART PANEL */}
            <section className="chart-section-card">
              <div className="chart-card-header">
                <div className="chart-header-left">
                  <div className="chart-badge-line">
                    <span className="chart-badge">
                      {dataMode === "simulation" ? "SIMULATION PROFILE" : "HARDWARE TELEMETRY STREAM"}
                    </span>
                    <span className="chart-sub-badge">ACTIVE POWER (kW)</span>
                  </div>
                  <h3>Diurnal Power Profile & Academic Baseline</h3>
                  <p>
                    {dataMode === "simulation"
                      ? "Continuous comparison between simulated power draw and the academic schedule baseline model"
                      : "Real-time electrical power telemetry received from the Express hardware API bridge"}
                  </p>
                </div>

                {/* Telemetry quick stats pills */}
                <div className="chart-quick-stats">
                  <div className="quick-stat-item">
                    <span className="qstat-label">Daily Peak</span>
                    <strong className="qstat-val">{peakPowerValue} kW</strong>
                  </div>
                  <div className="quick-stat-divider" />
                  <div className="quick-stat-item">
                    <span className="qstat-label">Average Load</span>
                    <strong className="qstat-val">{avgPowerValue} kW</strong>
                  </div>
                  <div className="quick-stat-divider" />
                  <div className="quick-stat-item">
                    <span className="qstat-label">Standby Floor</span>
                    <strong className="qstat-val">{minPowerValue} kW</strong>
                  </div>
                </div>
              </div>

              {/* Chart body or Hardware Empty State */}
              <div className="chart-body">
                {dataMode === "hardware" && displayReadings.length === 0 ? (
                  <div className="hardware-empty-card">
                    <div className="hw-empty-icon">
                      {apiError ? <WifiOff size={32} /> : <Cpu size={32} />}
                    </div>
                    <h4>{apiError ? "Express API Offline" : "Awaiting Hardware Readings"}</h4>
                    <p>
                      {apiError
                        ? "The dashboard could not reach http://localhost:5000. Start the backend with: cd backend && npm run dev."
                        : "Connected to Express backend. Send sample telemetry using the curl command below or switch to Simulation mode:"}
                    </p>
                    <div className="hw-curl-snippet">
                      <code>
                        curl -X POST http://localhost:5000/api/energy/readings -H &quot;Content-Type: application/json&quot; -d &apos;&#123;&quot;timestamp&quot;:&quot;{new Date().toISOString()}&quot;,&quot;power&quot;:4.2,&quot;voltage&quot;:230.1,&quot;current&quot;:14.2,&quot;energy&quot;:18.5,&quot;powerFactor&quot;:0.93,&quot;occupancy&quot;:25&#125;&apos;
                      </code>
                    </div>
                    <button
                      className="hw-empty-btn"
                      onClick={() => setDataMode("simulation")}
                    >
                      Switch to Simulation Mode
                    </button>
                  </div>
                ) : (
                  <div className="chart-svg-wrapper">
                    <ResponsiveContainer width="100%" height={320}>
                      <AreaChart
                        data={displayReadings}
                        margin={{ top: 16, right: 16, left: -10, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="powerGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>

                        <CartesianGrid
                          stroke="var(--chart-grid)"
                          strokeDasharray="3 3"
                          vertical={false}
                        />

                        <XAxis
                          dataKey="time"
                          tick={{ fill: "var(--chart-text)", fontSize: 11, fontWeight: 500 }}
                          axisLine={{ stroke: "var(--border)" }}
                          tickLine={false}
                        />

                        <YAxis
                          unit=" kW"
                          tick={{ fill: "var(--chart-text)", fontSize: 11, fontWeight: 500 }}
                          axisLine={false}
                          tickLine={false}
                          domain={[0, (dataMax: number) => Math.ceil((dataMax || 7) + 1)]}
                        />

                        <Tooltip
                          contentStyle={{
                            background: "var(--surface)",
                            border: "1px solid var(--border)",
                            borderRadius: 10,
                            boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
                            padding: "12px 14px",
                            color: "var(--text)",
                          }}
                          formatter={(value, name) => [
                            `${Number(value).toFixed(2)} kW`,
                            name === "power"
                              ? dataMode === "simulation"
                                ? "Simulated Power"
                                : "Hardware Power"
                              : "Baseline Demand",
                          ]}
                          labelFormatter={(label) => `Time: ${label}`}
                        />

                        {dataMode === "simulation" && (
                          <Area
                            type="monotone"
                            dataKey="baseline"
                            name="baseline"
                            stroke="#8da2b5"
                            strokeDasharray="5 5"
                            fill="none"
                            strokeWidth={2}
                          />
                        )}

                        <Area
                          type={dataMode === "simulation" ? "monotone" : "linear"}
                          dataKey="power"
                          name="power"
                          stroke="#14b8a6"
                          fill="url(#powerGradient)"
                          strokeWidth={2.6}
                          dot={dataMode === "hardware" ? { r: 5, fill: "#14b8a6" } : false}
                          activeDot={{ r: 6, fill: "#22d3ee", stroke: "var(--surface)", strokeWidth: 2 }}
                          connectNulls
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Chart Legend */}
              <div className="chart-legend-row">
                <div className="legend-items">
                  <span className="legend-item">
                    <span className="legend-swatch actual" />
                    <strong>{dataMode === "simulation" ? "Simulated Power Draw" : "Hardware Active Power"}</strong>
                    <span className="legend-sub">Instantaneous load (kW)</span>
                  </span>

                  {dataMode === "simulation" && (
                    <span className="legend-item">
                      <span className="legend-swatch baseline" />
                      <strong>Academic Baseline Model</strong>
                      <span className="legend-sub">Schedule-adjusted demand (kW)</span>
                    </span>
                  )}
                </div>

                <div className="chart-citation">
                  <Info size={13} />
                  <span>
                    {dataMode === "simulation"
                      ? "8-step diurnal profile: 00:00 to 21:00 (MCE Academic Schedule)"
                      : "True-RMS data sampled from local Express API bridge"}
                  </span>
                </div>
              </div>
            </section>

            {/* TWO-COLUMN LOWER SECTION: BUILDING STATUS & ACTIONABLE AI INSIGHTS */}
            <div className="overview-lower-grid">
              {/* LEFT: PILOT BUILDING & LOAD STATUS */}
              <section className="overview-card building-card">
                <div className="card-header">
                  <div className="card-header-icon">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <h3>Pilot Zone Sub-Systems</h3>
                    <p>Sub-circuit loads & hardware integration roadmap</p>
                  </div>
                </div>

                <div className="subsystems-list">
                  <div className="subsystem-item">
                    <div className="subsystem-icon-box hvac-icon">
                      <Thermometer size={18} />
                    </div>
                    <div className="subsystem-details">
                      <div className="subsystem-top">
                        <strong className="subsystem-name">Dual 2.0 TR Split HVAC</strong>
                        <span className="subsystem-tag load">~4.4 kW Peak Load</span>
                      </div>
                      <p className="subsystem-desc">
                        Primary cooling load; accounts for 68% of peak consumption at 12:00.
                      </p>
                      <div className="subsystem-meta">
                        <span>Schedule: 09:00 - 17:00</span>
                        <span>•</span>
                        <span>Thermostatic cycle</span>
                      </div>
                    </div>
                  </div>

                  <div className="subsystem-item">
                    <div className="subsystem-icon-box light-icon">
                      <Zap size={18} />
                    </div>
                    <div className="subsystem-details">
                      <div className="subsystem-top">
                        <strong className="subsystem-name">Ceiling & Stage LED Arrays</strong>
                        <span className="subsystem-tag load">~0.85 kW Total</span>
                      </div>
                      <p className="subsystem-desc">
                        18x 36W Troffers + 4x Stage spotlights with manual 3-bank switching.
                      </p>
                      <div className="subsystem-meta">
                        <span>Event-driven</span>
                        <span>•</span>
                        <span>Solid-state LED</span>
                      </div>
                    </div>
                  </div>

                  <div className="subsystem-item">
                    <div className="subsystem-icon-box av-icon">
                      <Cpu size={18} />
                    </div>
                    <div className="subsystem-details">
                      <div className="subsystem-top">
                        <strong className="subsystem-name">Audio-Visual & Rack Electronics</strong>
                        <span className="subsystem-tag load">~0.65 kW Peak</span>
                      </div>
                      <p className="subsystem-desc">
                        Laser projector, public address amplifier rack, and presentation console.
                      </p>
                      <div className="subsystem-meta">
                        <span>Active sessions</span>
                        <span>•</span>
                        <span>UPS buffered</span>
                      </div>
                    </div>
                  </div>

                  <div className="subsystem-item">
                    <div className="subsystem-icon-box standby-icon">
                      <Clock size={18} />
                    </div>
                    <div className="subsystem-details">
                      <div className="subsystem-top">
                        <strong className="subsystem-name">Standby & Idle Floor Load</strong>
                        <span className="subsystem-tag nominal">1.0 - 1.2 kW Base</span>
                      </div>
                      <p className="subsystem-desc">
                        Emergency egress luminaires, network switches, and standby appliance leakage.
                      </p>
                      <div className="subsystem-meta">
                        <span>Continuous 24/7</span>
                        <span>•</span>
                        <span>Standby baseline</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="readiness-summary-card">
                  <div className="readiness-header">
                    <ShieldCheck size={16} />
                    <span>Hardware Integration Checklist</span>
                  </div>
                  <div className="readiness-checks">
                    <div className="check-row done">
                      <CheckCircle2 size={14} />
                      <span>Electrical Sub-Distribution Audit (415V/63A panel cataloged)</span>
                    </div>
                    <div className="check-row done">
                      <CheckCircle2 size={14} />
                      <span>Express Backend API Bridge (:5000 operational)</span>
                    </div>
                    <div className="check-row in-progress">
                      <Clock size={14} />
                      <span>ESP32 Modbus RTU Edge Gateway (Firmware bench-tested)</span>
                    </div>
                    <div className="check-row pending">
                      <AlertTriangle size={14} />
                      <span>Physical CT clamp installation (Awaiting MCE campus clearance)</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* RIGHT: ACTIONABLE AI INSIGHTS SNAPSHOT */}
              <section className="overview-card insights-card">
                <div className="card-header">
                  <div className="card-header-icon brain-icon">
                    <BrainCircuit size={20} />
                  </div>
                  <div>
                    <h3>Rule-Based Diagnostic Intelligence</h3>
                    <p>Continuous heuristic anomaly detection against baseline</p>
                  </div>
                </div>

                <div className="heuristics-tag-row">
                  <span className="heuristic-pill">DETERMINISTIC HEURISTICS</span>
                  <span className="heuristic-pill">TRANSPARENT RULES</span>
                </div>

                <div className="insights-list">
                  {overviewInsights.map((insight) => (
                    <article className={`insight-card severity-${insight.severity}`} key={insight.id}>
                      <div className="insight-card-top">
                        <span className={`severity-badge ${insight.severity}`}>
                          {insight.severity === "high" && <Flame size={12} />}
                          {insight.severity === "medium" && <AlertTriangle size={12} />}
                          {insight.severity === "low" && <CheckCircle2 size={12} />}
                          {insight.severity.toUpperCase()} PRIORITY · {insight.time}
                        </span>
                        <span className="insight-deviation">
                          {insight.deviationPercent > 0 ? `+${insight.deviationPercent}%` : `${insight.deviationPercent}%`} vs baseline
                        </span>
                      </div>

                      <h4 className="insight-title">{insight.title}</h4>
                      <p className="insight-explanation">{insight.explanation}</p>

                      <div className="insight-recommendation-box">
                        <span className="rec-label">Actionable Recommendation:</span>
                        <p className="rec-text">{insight.recommendation}</p>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="insights-card-footer">
                  <button
                    className="view-all-insights-btn"
                    onClick={() => setActivePage("AI Insights")}
                  >
                    <span>View All Insights & Full Heuristic Engine</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </section>
            </div>

            {/* INSTITUTIONAL & PROTOTYPE DISCLAIMER FOOTER */}
            <footer className="overview-footer">
              <div className="footer-left">
                <strong>EnergyTwin AI · Building Energy Digital Twin</strong>
                <p>
                  Submitted for the Vishwakarma Awards 2026–27 | Malnad College of Engineering, Hassan, Karnataka
                </p>
              </div>

              <div className="footer-right">
                <span className="footer-status-pill">
                  <span className="footer-pulse-dot" />
                  Prototype Platform · Phase 1
                </span>
                <p className="footer-disclaimer">
                  Simulated telemetry is synthetic and illustrative. Physical metering requires authorized campus electrician installation.
                </p>
              </div>
            </footer>
          </div>
        )}
      </main>
    </div>
  );
}
