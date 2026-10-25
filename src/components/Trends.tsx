import { Activity, TrendingUp, Zap, BarChart3 } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import "./Trends.css";
import { energyReadings } from "../data/energyData";

export default function Trends() {
  const totalEnergy = energyReadings.reduce(
    (total, reading, index, readings) => {
      if (index === 0) return total;
      const hours = reading.hour - readings[index - 1].hour;
      return total + readings[index - 1].power * hours;
    },
    0,
  );

  const peak = Math.max(...energyReadings.map((r) => r.power));
  const average =
    energyReadings.reduce((sum, r) => sum + r.power, 0) / energyReadings.length;

  return (
    <div className="trends-page">
      <section className="trends-intro">
        <div>
          <span className="trends-eyebrow">ENERGY ANALYTICS</span>
          <h2>Consumption Trends</h2>
          <p>
            Explore demand patterns, compare actual readings with the
            illustrative baseline, and identify peak usage periods.
          </p>
        </div>
        <BarChart3 size={36} />
      </section>

      <section className="trends-metrics">
        <article className="trends-card">
          <Activity />
          <span>Estimated energy</span>
          <strong>{totalEnergy.toFixed(2)} kWh</strong>
          <small>Illustrative daily estimate</small>
        </article>

        <article className="trends-card">
          <TrendingUp />
          <span>Peak power</span>
          <strong>{peak.toFixed(2)} kW</strong>
          <small>Highest sample in the dataset</small>
        </article>

        <article className="trends-card">
          <Zap />
          <span>Average power</span>
          <strong>{average.toFixed(2)} kW</strong>
          <small>Average of available samples</small>
        </article>
      </section>

      <section className="trends-chart-panel">
        <div className="trends-panel-heading">
          <div>
            <h3>Power usage throughout the day</h3>
            <p>Actual illustrative readings versus baseline</p>
          </div>
          <span>SIMULATION DATA</span>
        </div>

        <div className="trends-chart">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={energyReadings}
              margin={{ top: 15, right: 15, left: 0, bottom: 5 }}
            >
              <defs>
                <linearGradient
                  id="trendsPowerFill"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#16c7d9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#16c7d9" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                tick={{ fill: "var(--chart-text)", fontSize: 11 }}
              />
              <YAxis
                unit=" kW"
                tick={{ fill: "var(--chart-text)", fontSize: 11 }}
              />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="power"
                name="Power (kW)"
                stroke="#16c7d9"
                fill="url(#trendsPowerFill)"
                strokeWidth={2.5}
              />
              <Line
                type="monotone"
                dataKey="baseline"
                name="Baseline (kW)"
                stroke="#94a3b8"
                strokeDasharray="5 4"
                dot={false}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <p className="trends-disclaimer">
        Demonstration only: these are illustrative readings, not measurements
        from the seminar hall's installed energy meter.
      </p>
    </div>
  );
}
