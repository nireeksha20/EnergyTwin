import React from "react";
import { Activity } from "lucide-react";
import "./EnergyTotalizer.css";

export type EnergyTotalizerProps = {
  value: number | null | undefined;
  dataMode: "simulation" | "hardware";
  isStale?: boolean;
  unavailableNote?: string;
  contextNote?: string;
};

export const EnergyTotalizer: React.FC<EnergyTotalizerProps> = ({
  value,
  dataMode,
  isStale = false,
  unavailableNote = "Requires ≥ 2 readings today",
  contextNote,
}) => {
  const isAvailable = value !== null && value !== undefined && !isNaN(value);

  // Format value into padded odometer-style string: e.g. "078.90" (3 integer digits + 2 decimals)
  let integerDigits: string[] = ["—", "—", "—"];
  let decimalDigits: string[] = ["—", "—"];

  if (isAvailable) {
    const num = Math.max(0, value);
    const fixedVal = num.toFixed(2);
    const [intPart, decPart] = fixedVal.split(".");
    const paddedInt = intPart.padStart(3, "0");
    integerDigits = paddedInt.split("");
    decimalDigits = decPart.split("");
  }

  return (
    <article className="energy-totalizer-card">
      {/* 1. Header with Icon and Title */}
      <div className="totalizer-header">
        <div className="totalizer-icon-box">
          <Activity size={18} />
        </div>
        <div className="totalizer-title-group">
          <span className="totalizer-eyebrow">ENERGY ACCUMULATOR</span>
          <h4 className="totalizer-title">Cumulative Active Energy</h4>
        </div>
      </div>

      {/* 2. Responsive Cyclometer / Odometer Register Window */}
      <div className="cyclometer-bezel">
        <div className="cyclometer-window">
          {/* Integer Digit Wheels */}
          <div className="digit-wheels-group integer-group">
            {integerDigits.map((digit, idx) => (
              <span key={`int-${idx}`} className="digit-wheel">
                {digit}
              </span>
            ))}
          </div>

          {/* Decimal Point */}
          <span className="decimal-separator">.</span>

          {/* Decimal Digit Wheels */}
          <div className="digit-wheels-group decimal-group">
            {decimalDigits.map((digit, idx) => (
              <span key={`dec-${idx}`} className="digit-wheel decimal-wheel">
                {digit}
              </span>
            ))}
          </div>

          {/* Unit Badge */}
          <span className="totalizer-unit">kWh</span>
        </div>
      </div>

      {/* 3. Energy vs Power Engineering Clarification */}
      <div className="totalizer-explanation-box">
        <div className="distinction-row">
          <span className="distinction-tag energy">E = ∫ P · dt (kWh)</span>
          <span className="distinction-divider">vs</span>
          <span className="distinction-tag power">P = V · I (kW)</span>
        </div>
        <p className="totalizer-explanation-text">
          Measures total electrical energy consumed over time, distinct from instantaneous power (kW).
        </p>
      </div>

      {/* 4. Footer Info & Status matching circular gauges */}
      <div className="totalizer-footer">
        <div className="totalizer-status-row">
          <span className="totalizer-caption">TOTAL ACTIVE ENERGY</span>
          <span
            className={`totalizer-badge ${
              !isAvailable
                ? "badge-unavailable"
                : dataMode === "simulation"
                  ? "badge-simulated"
                  : isStale
                    ? "badge-stale"
                    : "badge-hardware"
            }`}
          >
            {!isAvailable
              ? "UNAVAILABLE"
              : dataMode === "simulation"
                ? "SIMULATED"
                : isStale
                  ? "STALE HW"
                  : "HARDWARE"}
          </span>
        </div>

        <p className="totalizer-range-note">
          {isAvailable
            ? contextNote ||
              (dataMode === "simulation"
                ? "24h diurnal trapezoidal integral"
                : "Integral of today's timestamps")
            : unavailableNote}
        </p>
      </div>
    </article>
  );
};

export default EnergyTotalizer;
