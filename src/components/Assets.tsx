import React, { useState, useMemo } from "react";
import {
  Activity,
  AlertCircle,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Cpu,
  Layers,
  Power,
  Radio,
  Search,
  Server,
  ShieldCheck,
  Thermometer,
  Wind,
  Zap,
} from "lucide-react";
import "./Assets.css";

export type AssetCategory =
  | "all"
  | "distribution"
  | "monitoring"
  | "sensors"
  | "loads"
  | "software";

export type AssetStatusType =
  | "all"
  | "active"
  | "pending"
  | "ready"
  | "software";

export type Asset = {
  id: string;
  name: string;
  code: string;
  category: "distribution" | "monitoring" | "sensors" | "loads" | "software";
  categoryLabel: string;
  location: string;
  rating: string;
  purpose: string;
  status: string;
  statusType: "active" | "pending" | "ready" | "software";
  telemetryMode: string;
  iconName:
    | "zap"
    | "cpu"
    | "wind"
    | "radio"
    | "server"
    | "layers"
    | "thermometer"
    | "activity";
  specs: { [key: string]: string };
  uncertaintyNotes?: string;
};

const ASSET_REGISTRY: Asset[] = [
  // 1. Electrical Infrastructure
  {
    id: "asset-mdb",
    name: "Main Sub-Distribution Board",
    code: "MDB-MSH-01",
    category: "distribution",
    categoryLabel: "Electrical Infrastructure",
    location: "Mechanical Seminar Hall Electrical Panel",
    rating: "415V AC / 63A 3-Phase + Neutral",
    purpose:
      "Primary intake panel distributing 3-phase grid electricity to all seminar hall lighting, air conditioning, and equipment sub-circuits.",
    status: "Active Infrastructure",
    statusType: "active",
    telemetryMode: "Monitored Intake Feed",
    iconName: "zap",
    specs: {
      "Incomer Protection": "63A 4-Pole MCB (10kA breaking capacity)",
      "Operating Voltage":
        "415V (Phase-to-Phase) / 230V (Phase-Neutral nominal)",
      "Busbar Material": "Solid copper busbars with DIN-rail sub-feeder slots",
      "Sub-Circuit Distribution":
        "Separate dedicated breakers for HVAC, Lighting, and AV/General",
      "Inspection Status": "Verified by MCE electrical maintenance site audit",
    },
  },
  {
    id: "asset-sdb-ac",
    name: "HVAC Sub-Distribution Panel",
    code: "SDB-AC-01",
    category: "distribution",
    categoryLabel: "Electrical Infrastructure",
    location: "Seminar Hall Service Corridor (North Wall)",
    rating: "415V AC / 32A 3-Phase Sub-Feed",
    purpose:
      "Dedicated protective sub-panel isolating the high-draw air conditioning compressors and indoor fan coil units.",
    status: "Active Infrastructure",
    statusType: "active",
    telemetryMode: "Monitored via Main Feed",
    iconName: "zap",
    specs: {
      "Sub-Feeder Breaker": "32A 3-Pole MCB on main distribution board",
      "Branch Protection": "Dual 16A 2-Pole C-Curve MCBs (one per AC unit)",
      "Feeder Cable Specification":
        "4 sq.mm copper armored cable (To be confirmed)",
      "Grounding Protection":
        "Local pipe earthing connection (Pending site validation)",
      "Isolation Control":
        "Lockable rotary isolator adjacent to outdoor condenser units",
    },
    uncertaintyNotes:
      "Feeder cable gauge and earth resistance pending site validation.",
  },

  // 2. Energy Monitoring
  {
    id: "asset-mtr",
    name: "Multifunction Digital Energy Meter",
    code: "MTR-EM-01",
    category: "monitoring",
    categoryLabel: "Energy Monitoring",
    location: "MDB-MSH-01 Incomer Enclosure (Slot reserved)",
    rating: "Class 1.0 Accuracy / 50/5A CT Inputs",
    purpose:
      "Microprocessor meter measuring True-RMS active power (kW), reactive power (kVAR), voltage, current, and frequency on the main incomer.",
    status: "Pending Approval / Installation",
    statusType: "pending",
    telemetryMode: "No live meter telemetry yet",
    iconName: "activity",
    specs: {
      "Measurement Standard": "IEC 62053-21 Class 1.0 True-RMS accuracy",
      "Current Sensing": "3x Split-core current transformers (50/5A ratio)",
      "Communication Interface": "RS-485 2-Wire (Half-duplex differential)",
      "Protocol Specification":
        "Modbus RTU (9600 bps, 8 data bits, no parity, 1 stop bit)",
      "Installation Requirement":
        "Awaiting MCE campus clearance and work by licensed campus electrician",
      "Physical Deployment": "Not yet physically installed on live busbar",
    },
    uncertaintyNotes:
      "Procured hardware; physical live-circuit installation pending institutional clearance.",
  },

  // 3. Sensors & Gateway
  {
    id: "asset-gw",
    name: "IoT Edge Telemetry Gateway",
    code: "GW-ESP32-01",
    category: "sensors",
    categoryLabel: "Sensors & Gateway",
    location: "Control Panel DIN Rail (Test bench enclosure)",
    rating: "3.3V DC (240MHz Dual-Core Xtensa MCU)",
    purpose:
      "Embedded microcontroller node that polls the energy meter via Modbus RS-485 and uploads JSON telemetry packets over campus Wi-Fi.",
    status: "Bench Setup; Field Connection Pending",
    statusType: "ready",
    telemetryMode: "Not connected to field meter",
    iconName: "radio",
    specs: {
      "Microcontroller Unit": "ESP32-WROOM-32 (240MHz dual-core, 520KB SRAM)",
      "RS-485 Transceiver": "MAX485 transceiver with 120Ω bus termination",
      "Wireless Interface":
        "Wi-Fi 802.11 b/g/n (Configured for MCE-Campus-IoT SSID)",
      "Firmware Engine": "FreeRTOS Modbus Master client; HTTP POST JSON client",
      "Telemetry Destination":
        "POST http://localhost:5000/api/energy/readings (every 5s)",
      "Deployment State":
        "Firmware bench-tested; physical field installation pending meter setup",
    },
  },
  {
    id: "asset-env",
    name: "Indoor Environmental Sensor Node",
    code: "ENV-SN-01",
    category: "sensors",
    categoryLabel: "Sensors & Gateway",
    location: "Audience Seating Zone (Center wall mount)",
    rating: "3.3V DC / 0°C to 50°C, 20% to 90% RH",
    purpose:
      "Measures ambient room temperature and relative humidity to correlate indoor thermal comfort with cooling power consumption.",
    status: "Proposed Hardware",
    statusType: "pending",
    telemetryMode: "Simulated Model (Phase 2)",
    iconName: "thermometer",
    specs: {
      "Sensing Elements":
        "DHT22 / BME280 digital temperature & humidity sensor",
      "Temperature Tolerance":
        "±0.5°C operating range (Pending site validation)",
      "Humidity Tolerance":
        "±2%–5% relative humidity (Pending site validation)",
      "Data Communication": "1-Wire / I2C digital link to ESP32 gateway node",
      "Physical Deployment":
        "Proposed Phase-2 hardware; currently represented via baseline model",
    },
    uncertaintyNotes:
      "Proposed Phase-2 enhancement; not yet physically deployed in the seminar hall.",
  },

  // 4. Building Loads
  {
    id: "asset-hvac",
    name: "Dual Inverter Split Air Conditioners",
    code: "HVAC-SYS-01/02",
    category: "loads",
    categoryLabel: "Building Loads",
    location: "Seminar Hall Main Chamber (East & West walls)",
    rating: "Dual 2.0 TR (4.4 kW Total Peak Electrical Load)",
    purpose:
      "Primary climate cooling system providing thermal regulation for up to 120 seated occupants during daytime seminars.",
    status: "Active Infrastructure",
    statusType: "active",
    telemetryMode: "Monitored via Main Feed",
    iconName: "wind",
    specs: {
      "Cooling Capacity":
        "24,000 BTU/hr each (48,000 BTU/hr aggregate capacity)",
      "Compressor Architecture": "Variable-speed BLDC inverter compressor",
      "Operating Power":
        "2.2 kW per outdoor unit at 100% capacity (4.4 kW total)",
      "Thermostat Settings":
        "24°C nominal setpoint with manual cordless remote control",
      "Peak Consumption Contribution":
        "Accounts for approximately 68% of peak demand at 12:00",
      "Sub-Metering Status":
        "Monitored as aggregate load through main sub-incomer",
    },
  },
  {
    id: "asset-ltg",
    name: "Seminar Hall Lighting & Stage Array",
    code: "LTG-ARRAY-01",
    category: "loads",
    categoryLabel: "Building Loads",
    location: "Main Ceiling Grid & Presenter Stage Truss",
    rating: "0.85 kW Total Connected Load",
    purpose:
      "Energy-efficient solid-state LED illumination across audience seating rows, speaker podium, and projection screen areas.",
    status: "Active Infrastructure",
    statusType: "active",
    telemetryMode: "Monitored via Main Feed",
    iconName: "layers",
    specs: {
      "Luminaire Inventory":
        "18x 36W recessed LED troffers + 4x 50W directional stage spotlights",
      "Luminous Efficiency":
        "> 110 lumens/Watt high-efficiency drivers (To be confirmed)",
      "Circuit Switching":
        "3-bank manual wall switches (Audience, Podium, Stage)",
      "Standby Power Draw": "< 5W transformer and driver idle leakage",
      "Sub-Metering Status":
        "Monitored as aggregate load through main sub-incomer",
    },
    uncertaintyNotes:
      "Exact luminaire driver efficiency rating to be confirmed during lighting audit.",
  },
  {
    id: "asset-av",
    name: "Audio-Visual & Presentation Rack",
    code: "AV-RACK-01",
    category: "loads",
    categoryLabel: "Building Loads",
    location: "Speaker Podium & Projection Booth",
    rating: "0.65 kW Peak Operational Load",
    purpose:
      "Powers presentation laser projector, motorized projection screen, audio mixer, and public address sound reinforcement.",
    status: "Active Infrastructure",
    statusType: "active",
    telemetryMode: "Monitored via Main Feed",
    iconName: "server",
    specs: {
      "Projection Engine":
        "Laser phosphor projector (~380W active operating draw)",
      "Sound Reinforcement":
        "2x 250W Class-D PA amplifier + 8-channel audio mixer (~180W)",
      "Standby Consumption":
        "~25W continuous draw when audio electronics are in standby",
      "Power Protection":
        "1kVA offline UPS buffer (Battery status: Pending site validation)",
      "Sub-Metering Status":
        "Monitored as aggregate load through main sub-incomer",
    },
    uncertaintyNotes:
      "UPS backup battery runtime and health pending physical verification.",
  },

  // 5. Software Services
  {
    id: "asset-api",
    name: "Express Telemetry Bridge & API Service",
    code: "SRV-API-01",
    category: "software",
    categoryLabel: "Software Services",
    location: "Campus Host / Local Workstation Environment",
    rating: "Node.js 20+ / Express REST Engine (:5000)",
    purpose:
      "Local microservice providing REST endpoints for ingestion, 500-sample circular memory caching, and CORS communication.",
    status: "Active Software Bridge",
    statusType: "software",
    telemetryMode: "HTTP REST (:5000)",
    iconName: "cpu",
    specs: {
      "Runtime Environment": "TypeScript / Node.js Express server on Port 5000",
      "Health Endpoint":
        "GET /api/health (Service availability & uptime check)",
      "Readings Endpoint":
        "GET /api/energy/readings (Streams last 500 telemetry frames)",
      "Ingestion Endpoint":
        "POST /api/energy/readings (Validates voltage, current, power)",
      "Cache Architecture":
        "Circular 500-sample in-memory buffer (No cloud dependency)",
    },
  },
  {
    id: "asset-sim",
    name: "Diurnal Schedule Simulation Engine",
    code: "SIM-ENG-01",
    category: "software",
    categoryLabel: "Software Services",
    location: "EnergyTwin Client Runtime (In-browser data layer)",
    rating: "8 Diurnal Schedule Checkpoints (00:00 to 21:00)",
    purpose:
      "Generates synthetic 24-hour diurnal load curves modeled after typical academic seminar hall schedules for baseline benchmarking.",
    status: "Configured Software",
    statusType: "software",
    telemetryMode: "Synthetic Diurnal Engine",
    iconName: "activity",
    specs: {
      "Diurnal Resolution":
        "3-hour schedule intervals across full 24-hour daily cycle",
      "Modeled Parameters":
        "Active power, baseline power, supply voltage, current, and occupancy",
      "Baseline Formulation":
        "Empirical seminar hall academic baseline (1.2 kW to 4.7 kW)",
      "Data Policy":
        "Strictly labeled as synthetic data to preserve measurement integrity",
    },
  },
];

const SECTIONS: {
  category: AssetCategory;
  title: string;
  icon: React.ReactNode;
  description: string;
}[] = [
  {
    category: "distribution",
    title: "Electrical Infrastructure",
    icon: <Zap size={17} />,
    description:
      "Main intake panel, sub-distribution boards, and circuit protection feeding the pilot hall.",
  },
  {
    category: "monitoring",
    title: "Energy Monitoring",
    icon: <Activity size={17} />,
    description:
      "Multi-function digital meters and current transformer sensing on the electrical intake.",
  },
  {
    category: "sensors",
    title: "Sensors & Gateway",
    icon: <Radio size={17} />,
    description:
      "Microcontroller edge gateways and ambient indoor environmental telemetry hardware.",
  },
  {
    category: "loads",
    title: "Building Loads",
    icon: <Wind size={17} />,
    description:
      "Major electrical consuming equipment (air conditioning, lighting arrays, and AV systems).",
  },
  {
    category: "software",
    title: "Software Services",
    icon: <Server size={17} />,
    description:
      "Local Express REST telemetry bridge and academic diurnal simulation engine.",
  },
];

export default function Assets() {
  const [activeCategory, setActiveCategory] = useState<AssetCategory>("all");
  const [activeStatus, setActiveStatus] = useState<AssetStatusType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedAssetIds, setExpandedAssetIds] = useState<Set<string>>(
    new Set(),
  );

  // Toggle individual asset technical details drawer
  const toggleDetails = (assetId: string) => {
    setExpandedAssetIds((prev) => {
      const next = new Set(prev);
      if (next.has(assetId)) {
        next.delete(assetId);
      } else {
        next.add(assetId);
      }
      return next;
    });
  };

  // Summary counts
  const totalAssetsCount = ASSET_REGISTRY.length;
  const activeInfraCount = ASSET_REGISTRY.filter(
    (a) => a.statusType === "active",
  ).length;
  const pendingCount = ASSET_REGISTRY.filter(
    (a) => a.statusType === "pending" || a.statusType === "ready",
  ).length;
  const softwareCount = ASSET_REGISTRY.filter(
    (a) => a.statusType === "software",
  ).length;

  // Filtered asset dataset
  const filteredAssets = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return ASSET_REGISTRY.filter((asset) => {
      // Category filter
      if (activeCategory !== "all" && asset.category !== activeCategory) {
        return false;
      }

      // Status filter
      if (activeStatus !== "all") {
        if (activeStatus === "active" && asset.statusType !== "active")
          return false;
        if (activeStatus === "pending" && asset.statusType !== "pending")
          return false;
        if (activeStatus === "ready" && asset.statusType !== "ready")
          return false;
        if (activeStatus === "software" && asset.statusType !== "software")
          return false;
      }

      // Search query filter (matches name, code, location, purpose, rating, or specs)
      if (query) {
        const matchesName = asset.name.toLowerCase().includes(query);
        const matchesCode = asset.code.toLowerCase().includes(query);
        const matchesLocation = asset.location.toLowerCase().includes(query);
        const matchesPurpose = asset.purpose.toLowerCase().includes(query);
        const matchesRating = asset.rating.toLowerCase().includes(query);
        const matchesSpecs = Object.values(asset.specs).some((val: string) =>
          val.toLowerCase().includes(query),
        );

        if (
          !matchesName &&
          !matchesCode &&
          !matchesLocation &&
          !matchesPurpose &&
          !matchesRating &&
          !matchesSpecs
        ) {
          return false;
        }
      }

      return true;
    });
  }, [searchQuery, activeCategory, activeStatus]);

  // Master Expand / Collapse Toggle that operates on currently visible/filtered assets
  const isAllExpanded =
    filteredAssets.length > 0 &&
    filteredAssets.every((a) => expandedAssetIds.has(a.id));

  const toggleAllDetails = () => {
    if (isAllExpanded) {
      setExpandedAssetIds((prev) => {
        const next = new Set(prev);
        filteredAssets.forEach((a) => next.delete(a.id));
        return next;
      });
    } else {
      setExpandedAssetIds((prev) => {
        const next = new Set(prev);
        filteredAssets.forEach((a) => next.add(a.id));
        return next;
      });
    }
  };

  // Render Lucide icon helper
  const renderAssetIcon = (iconName: Asset["iconName"]) => {
    switch (iconName) {
      case "zap":
        return <Zap size={16} />;
      case "activity":
        return <Activity size={16} />;
      case "radio":
        return <Radio size={16} />;
      case "wind":
        return <Wind size={16} />;
      case "layers":
        return <Layers size={16} />;
      case "server":
        return <Server size={16} />;
      case "cpu":
        return <Cpu size={16} />;
      case "thermometer":
        return <Thermometer size={16} />;
      default:
        return <Zap size={16} />;
    }
  };

  return (
    <div className="assets-page-container">
      {/* 1. PAGE HEADER */}
      <section className="assets-hero-header">
        <div className="assets-header-text">
          <div className="assets-eyebrow-row">
            <span className="assets-badge-pill">
              EQUIPMENT & TELEMETRY REGISTRY
            </span>
            <span className="assets-badge-pill site">
              PILOT: MECHANICAL SEMINAR HALL (MCE HASSAN)
            </span>
          </div>
          <h1>Building Assets</h1>
          <p className="assets-description">
            Complete inventory of electrical infrastructure, sub-metering
            hardware, IoT gateways, connected loads, and software services
            monitored or planned for the Mechanical Seminar Hall pilot.
          </p>
        </div>

        {/* Site Clearance Safety Alert */}
        <div className="assets-safety-callout">
          <ShieldCheck size={16} className="safety-icon" />
          <div className="safety-text">
            <strong>Site Verification Protocol:</strong> Physical installation
            of sub-metering hardware on the 415V distribution board is subject
            to campus administrative clearance and will be carried out by an
            authorized electrician. Uninstalled hardware and software bridges
            are accurately labeled below.
          </div>
        </div>
      </section>

      {/* 2. COMPACT SUMMARY CARDS */}
      <section className="assets-summary-grid">
        <div className="summary-metric-card">
          <div className="summary-card-header">
            <span className="summary-label">Total Assets</span>
            <Building2 size={15} className="summary-icon total" />
          </div>
          <strong className="summary-number">{totalAssetsCount}</strong>
          <span className="summary-sub">Cataloged pilot components</span>
        </div>

        <div className="summary-metric-card">
          <div className="summary-card-header">
            <span className="summary-label">Active Infrastructure</span>
            <CheckCircle2 size={15} className="summary-icon active" />
          </div>
          <strong className="summary-number text-active">
            {activeInfraCount}
          </strong>
          <span className="summary-sub">
            In-place electrical equipment & loads
          </span>
        </div>

        <div className="summary-metric-card">
          <div className="summary-card-header">
            <span className="summary-label">Pending Installation</span>
            <Clock size={15} className="summary-icon pending" />
          </div>
          <strong className="summary-number text-pending">
            {pendingCount}
          </strong>
          <span className="summary-sub">
            Meter and sensor installation pending; gateway setup is not
            field-connected
          </span>
        </div>

        <div className="summary-metric-card">
          <div className="summary-card-header">
            <span className="summary-label">Software & Simulation</span>
            <Cpu size={15} className="summary-icon software" />
          </div>
          <strong className="summary-number text-software">
            {softwareCount}
          </strong>
          <span className="summary-sub">Express REST API & diurnal model</span>
        </div>
      </section>

      {/* 3. SEARCH & DUAL FILTERS TOOLBAR */}
      <div className="assets-control-bar">
        {/* Search Input */}
        <div className="assets-search-box">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            className="search-input-field"
            placeholder="Search by asset name, identifier, location, or spec..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="clear-search-btn"
              onClick={() => setSearchQuery("")}
              title="Clear search"
              type="button"
            >
              ×
            </button>
          )}
        </div>

        {/* Master Expand / Collapse Toggle */}
        <button
          className="master-toggle-btn"
          onClick={toggleAllDetails}
          title={
            isAllExpanded
              ? "Collapse visible technical details"
              : "Expand visible technical details"
          }
          type="button"
          disabled={filteredAssets.length === 0}
        >
          {isAllExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          <span>
            {isAllExpanded ? "Collapse All Details" : "Expand All Details"}
          </span>
        </button>
      </div>

      {/* Category Pills & Status Dropdown Filters */}
      <div className="assets-filter-row">
        {/* Category Pills */}
        <div
          className="category-pills-group"
          role="tablist"
          aria-label="Asset Category Filter"
        >
          <button
            type="button"
            className={`category-pill ${activeCategory === "all" ? "active" : ""}`}
            onClick={() => setActiveCategory("all")}
          >
            All Categories ({totalAssetsCount})
          </button>
          <button
            type="button"
            className={`category-pill ${activeCategory === "distribution" ? "active" : ""}`}
            onClick={() => setActiveCategory("distribution")}
          >
            Electrical Infrastructure (
            {ASSET_REGISTRY.filter((a) => a.category === "distribution").length}
            )
          </button>
          <button
            type="button"
            className={`category-pill ${activeCategory === "monitoring" ? "active" : ""}`}
            onClick={() => setActiveCategory("monitoring")}
          >
            Energy Monitoring (
            {ASSET_REGISTRY.filter((a) => a.category === "monitoring").length})
          </button>
          <button
            type="button"
            className={`category-pill ${activeCategory === "sensors" ? "active" : ""}`}
            onClick={() => setActiveCategory("sensors")}
          >
            Sensors & Gateway (
            {ASSET_REGISTRY.filter((a) => a.category === "sensors").length})
          </button>
          <button
            type="button"
            className={`category-pill ${activeCategory === "loads" ? "active" : ""}`}
            onClick={() => setActiveCategory("loads")}
          >
            Building Loads (
            {ASSET_REGISTRY.filter((a) => a.category === "loads").length})
          </button>
          <button
            type="button"
            className={`category-pill ${activeCategory === "software" ? "active" : ""}`}
            onClick={() => setActiveCategory("software")}
          >
            Software Services (
            {ASSET_REGISTRY.filter((a) => a.category === "software").length})
          </button>
        </div>

        {/* Status Filter */}
        <div className="status-filter-wrapper">
          <label htmlFor="status-select" className="status-filter-label">
            Status:
          </label>
          <select
            id="status-select"
            className="status-dropdown"
            value={activeStatus}
            onChange={(e) => setActiveStatus(e.target.value as AssetStatusType)}
          >
            <option value="all">All Statuses ({totalAssetsCount})</option>
            <option value="active">
              Active Infrastructure ({activeInfraCount})
            </option>
            <option value="pending">
              Pending Installation (
              {ASSET_REGISTRY.filter((a) => a.statusType === "pending").length})
            </option>
            <option value="ready">
              Bench Setup / Field Connection Pending (
              {ASSET_REGISTRY.filter((a) => a.statusType === "ready").length})
            </option>
            <option value="software">
              Software / Simulation ({softwareCount})
            </option>
          </select>
        </div>
      </div>

      {/* 4. ASSET SECTIONS AND CARDS */}
      <div className="assets-content-area">
        {SECTIONS.map((section) => {
          // Filter items belonging to this section from the active filtered results
          const sectionAssets = filteredAssets.filter(
            (a) => a.category === section.category,
          );

          // If category filter is applied and does not match this section, skip
          if (activeCategory !== "all" && activeCategory !== section.category) {
            return null;
          }

          // If search/status filter filtered out all items in this section, hide section header
          if (sectionAssets.length === 0) {
            return null;
          }

          return (
            <section className="asset-group-section" key={section.category}>
              {/* Section Header */}
              <div className="section-group-header">
                <div className="section-title-wrapper">
                  <div className="section-icon-badge">{section.icon}</div>
                  <div>
                    <h2 className="section-heading-text">
                      {section.title}
                      <span className="section-count-tag">
                        {sectionAssets.length}
                      </span>
                    </h2>
                    <p className="section-description-text">
                      {section.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Responsive 3-Column / 2-Column / 1-Column Cards Grid */}
              <div className="assets-card-grid">
                {sectionAssets.map((asset) => {
                  const isExpanded = expandedAssetIds.has(asset.id);

                  return (
                    <article className="asset-inventory-card" key={asset.id}>
                      {/* Top Meta Row: Icon + Identifier Code on left, Truthful Status Pill on right */}
                      <div className="card-header-block">
                        <div className="card-meta-row">
                          <div className="card-code-group">
                            <div className="card-icon-container">
                              {renderAssetIcon(asset.iconName)}
                            </div>
                            <span className="asset-identifier-badge">
                              {asset.code}
                            </span>
                          </div>

                          <span
                            className={`asset-status-pill status-${asset.statusType}`}
                          >
                            {asset.statusType === "active" && (
                              <CheckCircle2 size={11} />
                            )}
                            {asset.statusType === "pending" && (
                              <Clock size={11} />
                            )}
                            {asset.statusType === "ready" && (
                              <Activity size={11} />
                            )}
                            {asset.statusType === "software" && (
                              <Power size={11} />
                            )}
                            <span>{asset.status}</span>
                          </span>
                        </div>

                        {/* Full Width Asset Title */}
                        <h3 className="asset-name-title" title={asset.name}>
                          {asset.name}
                        </h3>
                      </div>

                      {/* Plain-English Purpose Statement */}
                      <p className="asset-purpose-statement">{asset.purpose}</p>

                      {/* Primary Facts Box (Location & Rating) */}
                      <div className="card-primary-facts-box">
                        <div className="fact-item">
                          <span className="fact-label">Physical Location</span>
                          <span className="fact-value" title={asset.location}>
                            {asset.location}
                          </span>
                        </div>
                        <div className="fact-divider" />
                        <div className="fact-item">
                          <span className="fact-label">
                            Primary Rating / Capacity
                          </span>
                          <strong
                            className="fact-value highlight"
                            title={asset.rating}
                          >
                            {asset.rating}
                          </strong>
                        </div>
                      </div>

                      {/* Telemetry Channel Tag */}
                      <div className="card-telemetry-strip">
                        <span className="telemetry-caption">
                          Telemetry Integration
                        </span>
                        <span className="telemetry-value-tag">
                          {asset.telemetryMode}
                        </span>
                      </div>

                      {/* Collapsible Technical Details Trigger */}
                      <div className="card-details-trigger-row">
                        <button
                          type="button"
                          className="details-accordion-btn"
                          onClick={() => toggleDetails(asset.id)}
                          aria-expanded={isExpanded}
                        >
                          <span>
                            {isExpanded
                              ? "Hide Technical Details"
                              : "View Technical Details"}
                          </span>
                          {isExpanded ? (
                            <ChevronUp size={13} />
                          ) : (
                            <ChevronDown size={13} />
                          )}
                        </button>
                      </div>

                      {/* Collapsible Technical Specifications Drawer */}
                      {isExpanded && (
                        <div className="card-technical-drawer">
                          <div className="specs-table-container">
                            {Object.entries(asset.specs).map(
                              ([specKey, rawSpecVal]) => {
                                const specVal = String(rawSpecVal);
                                const isUncertain =
                                  specVal.includes("To be confirmed") ||
                                  specVal.includes("Pending site validation") ||
                                  specVal.includes("Not yet physically");

                                return (
                                  <div className="spec-table-row" key={specKey}>
                                    <span className="spec-term">{specKey}</span>
                                    <span
                                      className={`spec-definition ${
                                        isUncertain ? "spec-uncertain" : ""
                                      }`}
                                    >
                                      {specVal}
                                    </span>
                                  </div>
                                );
                              },
                            )}
                          </div>

                          {asset.uncertaintyNotes && (
                            <div className="uncertainty-note-box">
                              <AlertCircle size={13} className="note-icon" />
                              <span>{asset.uncertaintyNotes}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}

        {/* 5. HELPFUL EMPTY STATE */}
        {filteredAssets.length === 0 && (
          <div className="assets-no-results-card">
            <AlertCircle size={32} className="empty-state-icon" />
            <h3>No Matching Equipment or Services</h3>
            <p>
              No cataloged assets matched your current filters
              {searchQuery && (
                <>
                  {" "}
                  for &ldquo;<strong>{searchQuery}</strong>&rdquo;
                </>
              )}
              {activeCategory !== "all" && ` in ${activeCategory}`}
              {activeStatus !== "all" && ` with status "${activeStatus}"`}.
            </p>
            <div className="empty-actions">
              <button
                type="button"
                className="reset-all-filters-btn"
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("all");
                  setActiveStatus("all");
                }}
              >
                Reset All Filters & Search
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
