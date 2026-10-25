# EnergyTwin AI

**AI-Powered Building Energy Digital Twin for Intelligent Power Usage Optimization**  
*Submitted for the Vishwakarma Awards 2026–27 | Clean Tech & Sustainable Infrastructure*

EnergyTwin AI is a building-energy intelligence dashboard prototype designed to combine electrical measurements, contextual sensor data, a digital representation of a building, and explainable rule-based diagnostics to support informed energy-management decisions.

## Current Features

- **Redesigned Energy Overview Dashboard**: Live electrical parameters (True-RMS power, voltage, current, daily integral), pilot zone specifications, diurnal power profile charts, and actionable heuristic diagnostics.
- **Consumption Trends & Baseline Comparison**: 24-hour diurnal power profile juxtaposed against the academic schedule baseline model.
- **Pilot Digital Twin View**: Logical zone topology and system integration readiness mapping for the pilot facility.
- **Electrical Asset Registry**: Detailed catalog of power distribution boards, Class 1.0 energy meters, ESP32 IoT gateways, HVAC systems, and AV racks.
- **Rule-Based Energy Diagnostics**: Transparent anomaly heuristics with priority scoring, percentage excursions, and human-in-the-loop review actions.
- **Dual Telemetry Operation**: Seamless toggle between synthetic 24-hour simulation data and live Express REST backend ingestion.
- **Theme Support**: High-contrast, industrial-grade Dark and Light modes.

## Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Recharts, Lucide React
- **Backend Bridge**: Node.js, Express, TypeScript (Port 5000)
- **Architecture**: Modular REST telemetry pipeline, circular 500-sample cache, CORS enabled
- **Pilot Hardware Target**: ESP32 IoT Edge Gateway, RS-485 Modbus RTU, Class 1.0 CT Multifunction Meter

## Pilot Deployment

- **Location**: Mechanical Seminar Hall, Malnad College of Engineering (MCE), Hassan, Karnataka.
- **Monitored Circuit**: 415V/230V 3-Phase Sub-Distribution Board (63A 4-Pole Incomer).
- **Primary Loads**: Dual 2.0 TR Inverter Split AC units, 18x LED troffers + stage spots, AV presentation rack.
- **Site Clearance Notice**: Physical CT clamp and meter installation are subject to institutional clearance and must be completed by an authorized campus electrician.

## Run Locally

### Frontend

```bash
npm install
npm run dev
```

### Backend (Optional for Hardware Mode)

```bash
cd backend
npm install
npm run dev
```

The Express API starts at `http://localhost:5000`. You can stream telemetry readings via:

```bash
curl -X POST http://localhost:5000/api/energy/readings \
  -H "Content-Type: application/json" \
  -d '{"timestamp":"2026-10-25T10:00:00.000Z","power":4.5,"voltage":230.2,"current":15.1,"energy":18.2,"occupancy":35,"source":"hardware"}'
```

## Transparency & Disclaimer

This software is an engineering competition prototype. Simulated telemetry reflects synthetic diurnal models representing typical academic usage and must not be interpreted as physical revenue meter measurements. Rule-based diagnostic recommendations require human review before executing physical equipment adjustments.
