import React from "react";
import "./CircularGauge.css";

export type CircularGaugeProps = {
  id: string;
  label: string;
  sublabel?: string;
  unit: string;
  value: number | null | undefined;
  min: number;
  max: number;
  majorTicks: number[];
  minorTicksPerInterval?: number;
  precision?: number;
  nominalRange?: [number, number];
  warningRange?: [number, number];
  dangerRange?: [number, number];
  dataMode: "simulation" | "hardware";
  isStale?: boolean;
  unavailableNote?: string;
  nominalNote?: string;
};

export const CircularGauge: React.FC<CircularGaugeProps> = ({
  id,
  label,
  sublabel,
  unit,
  value,
  min,
  max,
  majorTicks,
  minorTicksPerInterval = 4,
  precision = 1,
  nominalRange,
  warningRange,
  dangerRange,
  dataMode,
  isStale = false,
  unavailableNote = "Measurement unavailable",
  nominalNote,
}) => {
  const isAvailable = value !== null && value !== undefined && !isNaN(value);

  // Clamp fraction between 0 and 1
  const fraction = isAvailable
    ? Math.min(Math.max((value - min) / (max - min), 0), 1)
    : 0;

  // Arc sweeps from 140 deg to 400 deg (span of 260 deg)
  // Needle points up at 270 deg (0 deg in SVG rotation)
  // At min (140 deg), rotation is -130 deg
  // At max (400 deg), rotation is +130 deg
  const needleAngle = -130 + fraction * 260;

  // Calculate coordinates for circular arc path
  const describeArc = (
    startVal: number,
    endVal: number,
    r: number,
  ): string => {
    const clampedStart = Math.min(Math.max(startVal, min), max);
    const clampedEnd = Math.min(Math.max(endVal, min), max);
    if (clampedEnd <= clampedStart) return "";

    const fStart = (clampedStart - min) / (max - min);
    const fEnd = (clampedEnd - min) / (max - min);

    const aStart = 140 + fStart * 260;
    const aEnd = 140 + fEnd * 260;

    const radStart = (aStart * Math.PI) / 180;
    const radEnd = (aEnd * Math.PI) / 180;

    const x1 = 100 + r * Math.cos(radStart);
    const y1 = 100 + r * Math.sin(radStart);
    const x2 = 100 + r * Math.cos(radEnd);
    const y2 = 100 + r * Math.sin(radEnd);

    const largeArcFlag = aEnd - aStart > 180 ? 1 : 0;

    return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
  };

  // Generate tick markers
  const tickRadiusOuter = 72;
  const tickRadiusMajorInner = 64;
  const tickRadiusMinorInner = 68;
  const labelRadius = 52;

  const ticks: React.ReactNode[] = [];

  // Major ticks and labels
  majorTicks.forEach((tickVal, idx) => {
    const f = (tickVal - min) / (max - min);
    const ang = 140 + f * 260;
    const rad = (ang * Math.PI) / 180;

    const x1 = 100 + tickRadiusMajorInner * Math.cos(rad);
    const y1 = 100 + tickRadiusMajorInner * Math.sin(rad);
    const x2 = 100 + tickRadiusOuter * Math.cos(rad);
    const y2 = 100 + tickRadiusOuter * Math.sin(rad);

    const xLbl = 100 + labelRadius * Math.cos(rad);
    const yLbl = 100 + labelRadius * Math.sin(rad) + 3;

    ticks.push(
      <line
        key={`major-${idx}`}
        x1={x1.toFixed(2)}
        y1={y1.toFixed(2)}
        x2={x2.toFixed(2)}
        y2={y2.toFixed(2)}
        className="gauge-major-tick"
      />,
    );

    ticks.push(
      <text
        key={`lbl-${idx}`}
        x={xLbl.toFixed(2)}
        y={yLbl.toFixed(2)}
        className="gauge-scale-label"
      >
        {tickVal}
      </text>,
    );

    // Minor ticks between this major tick and next
    if (idx < majorTicks.length - 1 && minorTicksPerInterval > 0) {
      const nextTickVal = majorTicks[idx + 1];
      const step = (nextTickVal - tickVal) / (minorTicksPerInterval + 1);

      for (let m = 1; m <= minorTicksPerInterval; m++) {
        const mVal = tickVal + step * m;
        const mf = (mVal - min) / (max - min);
        const mang = 140 + mf * 260;
        const mrad = (mang * Math.PI) / 180;

        const mx1 = 100 + tickRadiusMinorInner * Math.cos(mrad);
        const my1 = 100 + tickRadiusMinorInner * Math.sin(mrad);
        const mx2 = 100 + tickRadiusOuter * Math.cos(mrad);
        const my2 = 100 + tickRadiusOuter * Math.sin(mrad);

        ticks.push(
          <line
            key={`minor-${idx}-${m}`}
            x1={mx1.toFixed(2)}
            y1={my1.toFixed(2)}
            x2={mx2.toFixed(2)}
            y2={my2.toFixed(2)}
            className="gauge-minor-tick"
          />,
        );
      }
    }
  });

  // Scale colored arcs
  const arcRadius = 72;
  const baseArc = describeArc(min, max, arcRadius);
  const nominalArc = nominalRange
    ? describeArc(nominalRange[0], nominalRange[1], arcRadius)
    : "";
  const warningArc = warningRange
    ? describeArc(warningRange[0], warningRange[1], arcRadius)
    : "";
  const dangerArc = dangerRange
    ? describeArc(dangerRange[0], dangerRange[1], arcRadius)
    : "";

  return (
    <article className={`circular-gauge-card ${!isAvailable ? "gauge-unavailable" : ""}`}>
      {/* Instrument Bezel & Dial SVG */}
      <div className="gauge-svg-container">
        <svg
          viewBox="0 0 200 200"
          className="gauge-svg"
          role="img"
          aria-label={`${label}: ${isAvailable ? `${value.toFixed(precision)} ${unit}` : "unavailable"}`}
        >
          <defs>
            {/* Outer Bezel Gradients */}
            <linearGradient id={`bezel-grad-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2c415d" />
              <stop offset="50%" stopColor="#152438" />
              <stop offset="100%" stopColor="#0c1624" />
            </linearGradient>

            {/* Inner Dial Face Radial Gradient */}
            <radialGradient id={`dial-grad-${id}`} cx="50%" cy="45%" r="55%">
              <stop offset="0%" stopColor="#101d2d" />
              <stop offset="75%" stopColor="#0a121e" />
              <stop offset="100%" stopColor="#060c14" />
            </radialGradient>

            {/* Needle Pivot Metallic Gradient */}
            <radialGradient id={`pivot-grad-${id}`} cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#5eead4" />
              <stop offset="50%" stopColor="#14b8a6" />
              <stop offset="100%" stopColor="#0d1b2a" />
            </radialGradient>

            {/* Glowing Drop-shadow for Needle */}
            <filter id={`needle-glow-${id}`} x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#22d3ee" floodOpacity="0.65" />
            </filter>
          </defs>

          {/* Outer Bezel */}
          <circle cx="100" cy="100" r="97" className="gauge-bezel-outer" fill={`url(#bezel-grad-${id})`} />
          <circle cx="100" cy="100" r="93" className="gauge-bezel-ring" />
          <circle cx="100" cy="100" r="88" className="gauge-dial-face" fill={`url(#dial-grad-${id})`} />

          {/* Decorative Corner Mounting Screws on Bezel */}
          <circle cx="20" cy="20" r="2.5" className="gauge-screw" />
          <circle cx="180" cy="20" r="2.5" className="gauge-screw" />
          <circle cx="20" cy="180" r="2.5" className="gauge-screw" />
          <circle cx="180" cy="180" r="2.5" className="gauge-screw" />

          {/* Scale Base Track Arc */}
          {baseArc && <path d={baseArc} className="gauge-scale-track" />}

          {/* Configurable Range Zones (Nominal, Warning, Danger) */}
          {nominalArc && <path d={nominalArc} className="gauge-zone-nominal" />}
          {warningArc && <path d={warningArc} className="gauge-zone-warning" />}
          {dangerArc && <path d={dangerArc} className="gauge-zone-danger" />}

          {/* Scale Ticks and Numbers */}
          <g className="gauge-ticks-group">{ticks}</g>

          {/* Center Title in Dial */}
          <text x="100" y="78" className="gauge-dial-title">
            {label}
          </text>
          {sublabel && (
            <text x="100" y="88" className="gauge-dial-subtitle">
              {sublabel}
            </text>
          )}

          {/* Moving Needle (Smooth Animated CSS Transform) */}
          <g
            className="gauge-needle-group"
            style={{
              transform: `rotate(${needleAngle}deg)`,
            }}
            filter={`url(#needle-glow-${id})`}
          >
            {/* Tapered Pointer Geometry */}
            <polygon
              points="100,28 102.4,96 101.5,116 100,118 98.5,116 97.6,96"
              className="gauge-needle-blade"
            />
            {/* Counterweight Tail Ring */}
            <circle cx="100" cy="112" r="3.5" className="gauge-needle-counterweight" />
          </g>

          {/* Central Pivot Boss (Multi-layer chrome & jewel) */}
          <circle cx="100" cy="100" r="8.5" className="gauge-pivot-ring" />
          <circle cx="100" cy="100" r="5" fill={`url(#pivot-grad-${id})`} />
          <circle cx="100" cy="100" r="2" className="gauge-pivot-jewel" />

          {/* Digital Readout Display Bezel & Window */}
          <rect x="52" y="132" width="96" height="30" rx="5" className="gauge-readout-window" />
          <text x="100" y="152" className="gauge-readout-text">
            {isAvailable ? value.toFixed(precision) : "—"}
            {isAvailable && <tspan className="gauge-readout-unit"> {unit}</tspan>}
          </text>
        </svg>
      </div>

      {/* Information Header & Meta Footer */}
      <div className="gauge-info-footer">
        <div className="gauge-status-row">
          <span className="gauge-name">{label}</span>
          <span
            className={`gauge-badge ${
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

        <p className="gauge-range-note">
          {isAvailable
            ? nominalNote || `Range: ${min}–${max} ${unit}`
            : unavailableNote}
        </p>
      </div>
    </article>
  );
};

export default CircularGauge;
