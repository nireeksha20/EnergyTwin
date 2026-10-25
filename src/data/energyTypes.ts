export type EnergyReading = {
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
