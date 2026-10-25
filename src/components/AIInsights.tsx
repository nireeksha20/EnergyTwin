import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  RefreshCw,
  TrendingUp,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import "./AIInsights.css";
import { energyReadings, getEnergyInsights } from "../data/energyData";

type Severity = "High" | "Medium" | "Low";
type DataMode = "simulation" | "hardware";

type Insight = {
  id: number;
  severity: Severity;
  title: string;
  explanation: string;
  recommendation: string;
  time: string;
  excess: number;
};

type AIInsightsProps = {
  dataMode?: DataMode;
};

function AIInsights({ dataMode = "simulation" }: AIInsightsProps) {
  const [severityFilter, setSeverityFilter] = useState("All");
  const [showResolved, setShowResolved] = useState(false);
  const [resolvedIds, setResolvedIds] = useState<number[]>([]);

  const allInsights = useMemo<Insight[]>(
    () =>
      getEnergyInsights().map((item) => ({
        id: Number(item.id.replace("energy-", "")),
        severity:
          item.severity === "high"
            ? "High"
            : item.severity === "medium"
              ? "Medium"
              : "Low",
        title: item.title,
        explanation: item.explanation,
        recommendation: item.recommendation,
        time: item.time,
        excess: item.deviationPercent,
      })),
    [],
  );

  const visibleInsights = allInsights.filter((insight) => {
    const matchesSeverity =
      severityFilter === "All" || insight.severity === severityFilter;
    const isResolved = resolvedIds.includes(insight.id);
    return matchesSeverity && (showResolved || !isResolved);
  });

  const activeCount = allInsights.filter(
    (insight) => !resolvedIds.includes(insight.id),
  ).length;

  const highCount = allInsights.filter(
    (insight) =>
      insight.severity === "High" && !resolvedIds.includes(insight.id),
  ).length;

  const resolveInsight = (id: number) => {
    setResolvedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  return (
    <div className="ai-insights-page">
      <section className="ai-insights-intro">
        <div>
          <div className="ai-eyebrow">ENERGY INTELLIGENCE</div>
          <h2>AI Insights</h2>
          <p>
            Understand unusual energy patterns and explore practical actions for
            your building.
          </p>
        </div>
        <div className="ai-demo-badge">
          <Activity size={15} />
          {dataMode === "simulation" ? "DEMO ANALYSIS" : "RULE-BASED ANALYSIS"}
        </div>
      </section>

      <div className="ai-disclaimer">
        <AlertTriangle size={17} />
        <p>
          <strong>
            {dataMode === "simulation" ? "Simulation mode:" : "Prototype mode:"}
          </strong>{" "}
          These insights currently use illustrative readings and predefined
          rules. They are not predictions from a trained AI model. Hardware
          readings are not yet connected to this analysis.
        </p>
      </div>

      <section className="ai-summary-grid">
        <article className="ai-summary-card">
          <div className="ai-summary-icon">
            <AlertTriangle size={20} />
          </div>
          <span>Active insights</span>
          <strong>{activeCount}</strong>
          <small>Items requiring review</small>
        </article>

        <article className="ai-summary-card">
          <div className="ai-summary-icon">
            <TrendingUp size={20} />
          </div>
          <span>Largest deviation</span>
          <strong>
            {allInsights.length
              ? `${Math.max(0, ...allInsights.map((item) => item.excess)).toFixed(0)}%`
              : "—"}
          </strong>
          <small>Compared with illustrative baseline</small>
        </article>

        <article className="ai-summary-card">
          <div className="ai-summary-icon">
            <Zap size={20} />
          </div>
          <span>High-severity items</span>
          <strong>{highCount}</strong>
          <small>Require human review</small>
        </article>

        <article className="ai-summary-card">
          <div className="ai-summary-icon">
            <CheckCircle2 size={20} />
          </div>
          <span>Reviewed items</span>
          <strong>{resolvedIds.length}</strong>
          <small>Marked reviewed in this session</small>
        </article>
      </section>

      <section className="ai-panel">
        <div className="ai-panel-heading">
          <div>
            <h3>Consumption vs baseline</h3>
            <p>Illustrative power readings throughout the day</p>
          </div>
          <span className="ai-chart-tag">SAMPLE DATA · kW</span>
        </div>

        <div className="ai-chart">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={energyReadings.map((reading) => ({
                time: reading.time,
                actual: reading.power,
                baseline: reading.baseline,
              }))}
              margin={{ top: 12, right: 12, left: 0, bottom: 4 }}
            >
              <defs>
                <linearGradient
                  id="actualEnergyFill"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#13c6d8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#13c6d8" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--ai-grid)" />
              <XAxis
                dataKey="time"
                tick={{ fill: "var(--ai-muted)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                unit=" kW"
                tick={{ fill: "var(--ai-muted)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={55}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--ai-tooltip-bg)",
                  border: "1px solid var(--ai-border)",
                  borderRadius: 10,
                  color: "var(--ai-text)",
                  fontSize: 12,
                }}
                formatter={(value, name) => [
                  `${Number(value).toFixed(1)} kW`,
                  name === "actual" ? "Illustrative power" : "Baseline",
                ]}
              />
              <Area
                type="monotone"
                dataKey="actual"
                name="actual"
                stroke="#13c6d8"
                strokeWidth={2.5}
                fill="url(#actualEnergyFill)"
                dot={false}
                activeDot={{ r: 5 }}
              />
              <Area
                type="monotone"
                dataKey="baseline"
                name="baseline"
                stroke="#8b9bb4"
                strokeWidth={2}
                strokeDasharray="5 4"
                fill="none"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="ai-chart-legend">
          <span>
            <i className="ai-legend-actual" /> Illustrative power
          </span>
          <span>
            <i className="ai-legend-baseline" /> Illustrative baseline
          </span>
        </div>
      </section>

      <section className="ai-insight-list">
        <div className="ai-list-heading">
          <div>
            <h3>Detected patterns</h3>
            <p>Review each finding before acting on it.</p>
          </div>
          <label className="ai-filter">
            <span>Severity</span>
            <select
              value={severityFilter}
              onChange={(event) => setSeverityFilter(event.target.value)}
            >
              <option value="All">All levels</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </label>
        </div>

        <label className="ai-show-resolved">
          <input
            type="checkbox"
            checked={showResolved}
            onChange={(event) => setShowResolved(event.target.checked)}
          />
          Show reviewed items
        </label>

        {visibleInsights.length === 0 ? (
          <div className="ai-empty-state">
            <CheckCircle2 size={26} />
            <strong>No matching insights</strong>
            <p>Try another severity filter or show reviewed items.</p>
          </div>
        ) : (
          visibleInsights.map((insight) => {
            const isResolved = resolvedIds.includes(insight.id);
            return (
              <article
                className={`ai-insight-card severity-${insight.severity.toLowerCase()}`}
                key={insight.id}
              >
                <div className="ai-insight-top">
                  <div className="ai-insight-symbol">
                    {insight.severity === "High" ? (
                      <AlertTriangle size={20} />
                    ) : insight.severity === "Medium" ? (
                      <TrendingUp size={20} />
                    ) : (
                      <Lightbulb size={20} />
                    )}
                  </div>
                  <div className="ai-insight-title">
                    <div className="ai-insight-tags">
                      <span
                        className={`ai-severity ${insight.severity.toLowerCase()}`}
                      >
                        {insight.severity} severity
                      </span>
                      <span className="ai-time-tag">{insight.time}</span>
                      {isResolved && (
                        <span className="ai-reviewed-tag">Reviewed</span>
                      )}
                    </div>
                    <h4>{insight.title}</h4>
                  </div>
                </div>

                <div className="ai-insight-detail">
                  <strong>Why this was flagged</strong>
                  <p>{insight.explanation}</p>
                </div>

                <div className="ai-recommendation">
                  <Lightbulb size={18} />
                  <div>
                    <strong>Recommended action</strong>
                    <p>{insight.recommendation}</p>
                  </div>
                </div>

                <div className="ai-insight-actions">
                  <span>Rule-based demo · Not a confirmed fault</span>
                  <button onClick={() => resolveInsight(insight.id)}>
                    {isResolved ? "Undo review" : "Mark as reviewed"}
                  </button>
                </div>
              </article>
            );
          })
        )}
      </section>

      <section className="ai-human-review">
        <RefreshCw size={19} />
        <p>
          <strong>Human verification matters.</strong> A deviation is a signal
          to investigate, not proof of wasted energy. Consider occupancy,
          weather, equipment schedules and sensor quality before acting.
        </p>
      </section>
    </div>
  );
}

export default AIInsights;
