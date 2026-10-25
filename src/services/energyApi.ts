import type { EnergyReading } from "../data/energyTypes";

const API_BASE_URL = import.meta.env.VITE_ENERGY_API_URL ?? "";

export async function fetchHardwareReadings(): Promise<EnergyReading[]> {
  if (!API_BASE_URL) {
    throw new Error("Hardware API URL is not configured.");
  }

  const response = await fetch(`${API_BASE_URL}/api/energy/readings`);

  if (!response.ok) {
    throw new Error(`Failed to fetch energy readings: ${response.status}`);
  }

  const data: unknown = await response.json();

  if (!Array.isArray(data)) {
    throw new Error("Invalid energy API response.");
  }

  return data as EnergyReading[];
}
