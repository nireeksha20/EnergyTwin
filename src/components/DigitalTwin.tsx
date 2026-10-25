import {
  Building2,
  Lightbulb,
  Thermometer,
  Users,
  Zap,
  Activity,
} from "lucide-react";
import { energyReadings } from "../data/energyData";
import "./DigitalTwin.css";

function DigitalTwin() {
  const latest = energyReadings[energyReadings.length - 1];

  const zones = [
    {
      name: "Lighting",
      icon: Lightbulb,
      status: "Simulation",
      detail: "Lighting load · Not individually metered",
    },
    {
      name: "Occupancy",
      icon: Users,
      status: "Simulated",
      detail: `${latest.occupancy}% illustrative occupancy`,
    },
    {
      name: "Environment",
      icon: Thermometer,
      status: "Simulated",
      detail: "Temperature and humidity sensors pending",
    },
    {
      name: "Electrical supply",
      icon: Zap,
      status: "Meter pending",
      detail: `${latest.power.toFixed(1)} kW illustrative power`,
    },
  ];

  return (
    <div className="twin-page">
      <section className="twin-intro">
        <div>
          <span className="twin-eyebrow">BUILDING MODEL · PHASE 1</span>
          <h2>Mechanical Seminar Hall</h2>
          <p>
            A digital representation of the pilot zone, designed to connect
            building conditions with energy measurements.
          </p>
        </div>
        <span className="twin-badge">SIMULATION MODE</span>
      </section>

      <section className="twin-overview">
        <div className="twin-panel">
          <div className="twin-panel-heading">
            <Building2 size={21} />
            <div>
              <h3>Pilot zone model</h3>
              <p>Logical representation · Not a measured floor plan</p>
            </div>
          </div>

          <div className="twin-zone">
            <Building2 size={38} />
            <h3>Mechanical Seminar Hall</h3>
            <p>Building → Seminar Hall → Monitored circuit</p>
            <div className="twin-zone-line" />
            <div className="twin-circuit">
              <Zap size={19} />
              <div>
                <strong>Electrical circuit</strong>
                <span>Awaiting circuit identification</span>
              </div>
            </div>
          </div>
        </div>

        <div className="twin-panel twin-live-panel">
          <h3>Current illustrative state</h3>
          <p>Values below use sample data, not live sensors.</p>

          <div className="twin-reading">
            <span>Power</span>
            <strong>{latest.power.toFixed(1)} kW</strong>
          </div>
          <div className="twin-reading">
            <span>Voltage</span>
            <strong>{latest.voltage.toFixed(1)} V</strong>
          </div>
          <div className="twin-reading">
            <span>Current</span>
            <strong>{latest.current.toFixed(1)} A</strong>
          </div>
          <div className="twin-reading">
            <span>Baseline</span>
            <strong>{latest.baseline.toFixed(1)} kW</strong>
          </div>
        </div>
      </section>

      <section className="twin-panel">
        <div className="twin-panel-heading">
          <Activity size={21} />
          <div>
            <h3>Zone systems and data readiness</h3>
            <p>Integration status for the Phase-1 prototype</p>
          </div>
        </div>

        <div className="twin-systems">
          {zones.map(({ name, icon: Icon, status, detail }) => (
            <article className="twin-system-card" key={name}>
              <Icon size={23} />
              <h4>{name}</h4>
              <span>{status}</span>
              <p>{detail}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="twin-note">
        <Lightbulb size={19} />
        <p>
          <strong>Next integration:</strong> Replace sample readings with
          verified meter and sensor data after the circuit is identified and the
          authorized electrician completes installation.
        </p>
      </div>
    </div>
  );
}

export default DigitalTwin;
