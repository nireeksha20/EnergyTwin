import {
  Activity,
  Bell,
  Building2,
  BrainCircuit,
  ChevronDown,
  CircleHelp,
  Cpu,
  LayoutDashboard,
  Moon,
  Sun,
  TrendingUp,
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
import { energyReadings, getEnergySummary } from "./data/energyData";
import DigitalTwin from "./components/DigitalTwin";
import { useEffect, useState } from "react";
import { getEnergyReadings } from "./services/energyService";
import type { EnergyReading } from "./data/energyTypes";

type Theme = "dark" | "light";

// const latestReading = energyReadings[energyReadings.length - 1];
// const energySummary = getEnergySummary();

// const metrics = [
//   {
//     label: "Voltage",
//     value: `${latestReading.voltage.toFixed(1)}`,
//     unit: "V",
//     icon: Activity,
//     note: "Supply voltage",
//   },
//   {
//     label: "Current",
//     value: `${latestReading.current.toFixed(1)}`,
//     unit: "A",
//     icon: Zap,
//     note: "Measured current",
//   },
//   {
//     label: "Active Power",
//     value: `${latestReading.power.toFixed(2)}`,
//     unit: "kW",
//     icon: TrendingUp,
//     note: "Instantaneous power",
//   },
//   {
//     label: "Energy Today",
//     value: `${energySummary.estimatedDailyEnergy.toFixed(2)}`,
//     unit: "kWh",
//     icon: Activity,
//     note: "Daily consumption",
//   },
// ];

const navigation = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Trends", icon: TrendingUp },
  { label: "Digital Twin", icon: Building2 },
  { label: "Assets", icon: Cpu },
  { label: "AI Insights", icon: BrainCircuit },
];

function App() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [activePage, setActivePage] = useState("Overview");
  const [dataMode, setDataMode] = useState<"simulation" | "hardware">(
    "simulation",
  );
  const [apiReadings, setApiReadings] = useState<EnergyReading[]>([]);

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

  const latestDisplayReading =
    displayReadings.length > 0
      ? displayReadings[displayReadings.length - 1]
      : null;

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

  const energyTodayValue =
    dataMode === "simulation"
      ? getEnergySummary().estimatedDailyEnergy.toFixed(2)
      : (hardwareEnergyToday?.toFixed(2) ?? "—");

  const [apiError, setApiError] = useState("");

  const displayMetrics = [
    {
      label: "Voltage",
      value: latestDisplayReading?.voltage.toFixed(1) ?? "—",
      unit: "V",
      icon: Activity,
      note:
        dataMode === "hardware"
          ? hardwareEnergyToday === null
            ? "Need 2+ readings from today"
            : "Estimated from today's readings"
          : "Estimated daily consumption",
    },
    {
      label: "Current",
      value: latestDisplayReading?.current.toFixed(1) ?? "—",
      unit: "A",
      icon: Zap,
      note:
        dataMode === "hardware"
          ? "Latest hardware reading"
          : "Simulated current",
    },
    {
      label: "Active Power",
      value: latestDisplayReading?.power.toFixed(2) ?? "—",
      unit: "kW",
      icon: TrendingUp,
      note:
        dataMode === "hardware" ? "Latest hardware reading" : "Simulated power",
    },
    {
      label: "Energy Today",
      value: energyTodayValue,
      unit: dataMode === "hardware" ? "" : "kWh",
      icon: Activity,
      note:
        dataMode === "hardware"
          ? "Daily total not yet calculated"
          : "Estimated daily consumption",
    },
  ];

  useEffect(() => {
    let cancelled = false;

    async function loadReadings() {
      try {
        const readings = await getEnergyReadings(dataMode);
        if (!cancelled) {
          setApiReadings(readings);
          setApiError("");
        }
      } catch {
        if (!cancelled) {
          setApiReadings([]);
          setApiError(
            "Could not load hardware readings. Check that the backend is running.",
          );
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

  return (
    <div className={`app ${theme}`}>
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <Zap size={25} />
          </div>
          <div>
            <h2>
              EnergyTwin <span>AI</span>
            </h2>
            <p>BUILDING INTELLIGENCE</p>
          </div>
        </div>

        <div className="nav-label">WORKSPACE</div>
        <nav className="navigation">
          {navigation.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`nav-item ${activePage === label ? "active" : ""}`}
              onClick={() => setActivePage(label)}
            >
              <Icon size={19} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="connection-dot" />
          <div>
            <strong>Simulation mode</strong>
            <p>Hardware not connected</p>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <div className="eyebrow">MCE / MECHANICAL SEMINAR HALL</div>
            <h1>
              {activePage === "Overview" ? "Energy Overview" : activePage}
            </h1>
            <p className="page-description">
              Mechanical Seminar Hall · Building energy intelligence
            </p>
          </div>

          <div className="topbar-actions">
            <div className="data-mode-selector">
              <button
                className={dataMode === "simulation" ? "active" : ""}
                onClick={() => setDataMode("simulation")}
              >
                Simulation
              </button>

              <button
                className={dataMode === "hardware" ? "active" : ""}
                onClick={() => setDataMode("hardware")}
              >
                Hardware
              </button>
            </div>

            {dataMode === "hardware" && (
              <div className="hardware-status">
                {apiError || `Received ${apiReadings.length} hardware readings`}
              </div>
            )}
            <button
              className="icon-button"
              title="Toggle light and dark theme"
              aria-label="Toggle light and dark theme"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
            </button>
            <button className="icon-button" aria-label="Notifications">
              <Bell size={19} />
            </button>
          </div>
        </header>

        {activePage === "AI Insights" ? (
          <AIInsights dataMode={dataMode} />
        ) : activePage === "Digital Twin" ? (
          <DigitalTwin />
        ) : activePage === "Trends" ? (
          <Trends />
        ) : (
          <>
            <section className="welcome-panel">
              <div>
                <div className="eyebrow">PHASE 1 · PILOT BUILDING</div>
                <h2>Understand your building's energy.</h2>
                <p>
                  Monitor consumption, discover patterns and identify
                  opportunities to improve energy efficiency.
                </p>
              </div>
              <div className="welcome-icon">
                <Building2 size={42} />
              </div>
            </section>

            <div className="section-heading">
              <div>
                <h2>Energy at a glance</h2>
                <p>Illustrative readings for the initial prototype</p>
              </div>
              <button className="period-button">
                Today <ChevronDown size={15} />
              </button>
            </div>

            <section className="metrics-grid">
              {displayMetrics.map(
                ({ label, value, unit, icon: Icon, note }) => (
                  <article className="metric-card" key={label}>
                    <div className="metric-top">
                      <div className="metric-icon">
                        <Icon size={20} />
                      </div>
                      <span className="metric-label">{label}</span>
                    </div>
                    <div className="metric-value">
                      {value}
                      <span>{unit}</span>
                    </div>
                    <p className="metric-note">{note}</p>
                  </article>
                ),
              )}
            </section>

            <section className="content-grid">
              <article className="panel chart-panel">
                <div className="panel-heading">
                  <div>
                    <h3>Power consumption</h3>
                    <p>
                      {dataMode === "simulation"
                        ? "Illustrative energy usage throughout the day"
                        : "Power readings received from the backend"}
                    </p>
                  </div>
                  <span className="small-tag">
                    {dataMode === "simulation" ? "SIMULATED" : "HARDWARE DATA"}
                  </span>
                </div>

                <div className="chart-container">
                  {dataMode === "hardware" && displayReadings.length === 0 ? (
                    <div
                      style={{
                        padding: "40px 16px",
                        textAlign: "center",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {apiError || "Waiting for hardware readings…"}
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={displayReadings}
                        margin={{ top: 12, right: 12, left: -16, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient
                            id="powerFill"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor="#16c7d9"
                              stopOpacity={0.35}
                            />
                            <stop
                              offset="95%"
                              stopColor="#16c7d9"
                              stopOpacity={0.02}
                            />
                          </linearGradient>
                        </defs>

                        <CartesianGrid
                          stroke="var(--chart-grid)"
                          strokeDasharray="3 3"
                        />
                        <XAxis
                          dataKey="time"
                          tick={{ fill: "var(--chart-text)", fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          unit=" kW"
                          tick={{ fill: "var(--chart-text)", fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            background: "var(--panel-bg)",
                            border: "1px solid var(--border-color)",
                            borderRadius: 10,
                            color: "var(--text-primary)",
                          }}
                          formatter={(value, name) => [
                            `${value} kW`,
                            name === "power"
                              ? dataMode === "simulation"
                                ? "Simulated power"
                                : "Backend power"
                              : "Baseline",
                          ]}
                        />
                        {dataMode === "simulation" && (
                          <Area
                            type="monotone"
                            dataKey="baseline"
                            stroke="#8b9bb4"
                            strokeDasharray="5 5"
                            fill="none"
                            strokeWidth={2}
                          />
                        )}
                        <Area
                          type="linear"
                          dataKey="power"
                          stroke="#16c7d9"
                          fill={
                            dataMode === "simulation"
                              ? "url(#powerFill)"
                              : "none"
                          }
                          strokeWidth={2.5}
                          dot={dataMode === "hardware" ? { r: 5 } : false}
                          activeDot={{ r: 6 }}
                          connectNulls
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div className="chart-legend">
                  <span>
                    <i className="legend-actual" />
                    {dataMode === "simulation"
                      ? "Simulated power"
                      : "Hardware power"}
                  </span>

                  {dataMode === "simulation" && (
                    <span>
                      <i className="legend-baseline" /> Illustrative baseline
                    </span>
                  )}
                </div>
              </article>

              <article className="panel system-panel">
                <div className="panel-heading">
                  <div>
                    <h3>System status</h3>
                    <p>Prototype connectivity</p>
                  </div>
                  <Activity size={20} />
                </div>
                <div className="status-row">
                  <span
                    className={`status-indicator ${dataMode === "simulation" ? "simulated" : "connected"}`}
                  />
                  <div>
                    <strong>Data source</strong>
                    <p>
                      {dataMode === "simulation"
                        ? "Simulated readings"
                        : apiError
                          ? "Backend unavailable"
                          : apiReadings.length > 0
                            ? "Backend readings received"
                            : "Waiting for readings"}
                    </p>
                  </div>
                  <span className="status-text">
                    {dataMode === "simulation"
                      ? "DEMO"
                      : apiError
                        ? "ERROR"
                        : apiReadings.length > 0
                          ? "API"
                          : "WAITING"}
                  </span>
                </div>
                <div className="status-row">
                  <span className="status-indicator pending" />
                  <div>
                    <strong>Energy meter</strong>
                    <p>Awaiting installation</p>
                  </div>
                  <span className="status-text">PENDING</span>
                </div>
                <div className="status-row">
                  <span className="status-indicator pending" />
                  <div>
                    <strong>Sensor gateway</strong>
                    <p>ESP32 integration pending</p>
                  </div>
                  <span className="status-text">PENDING</span>
                </div>
              </article>
            </section>

            <section className="panel insight-panel">
              <div className="insight-icon">
                <CircleHelp size={22} />
              </div>
              <div>
                <div className="eyebrow">NEXT DEVELOPMENT MILESTONE</div>
                <h3>From readings to useful insights</h3>
                <p>
                  Next, we'll add interactive energy charts, then develop
                  baseline analysis and explainable AI recommendations.
                </p>
              </div>
            </section>

            <footer className="footer">
              <span>EnergyTwin AI · Building energy intelligence</span>
              <span>
                <span className="footer-dot" /> Prototype · Simulation mode
              </span>
            </footer>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
