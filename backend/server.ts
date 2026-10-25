import express from "express";
import cors from "cors";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

type EnergyReading = {
  timestamp: string;
  power: number;
  voltage: number;
  current: number;
  energy: number;
  occupancy: number | null;
  temperature: number | null;
  humidity: number | null;
  source: "simulation" | "hardware";
};

let latestReadings: EnergyReading[] = [];

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "EnergyTwin API" });
});

app.get("/api/energy/readings", (_req, res) => {
  res.json(latestReadings);
});

app.post("/api/energy/readings", (req, res) => {
  const reading = req.body as EnergyReading;

  if (
    !reading ||
    typeof reading.timestamp !== "string" ||
    typeof reading.power !== "number" ||
    typeof reading.voltage !== "number" ||
    typeof reading.current !== "number"
  ) {
    res.status(400).json({ error: "Invalid energy reading." });
    return;
  }

  const hardwareReading: EnergyReading = {
    ...reading,
    source: "hardware",
  };

  latestReadings = [...latestReadings, hardwareReading].slice(-500);

  res.status(201).json({
    message: "Reading received",
    count: latestReadings.length,
  });
});

app.listen(PORT, () => {
  console.log(`EnergyTwin API running at http://localhost:${PORT}`);
});
