import type { EnergyReading } from "../data/energyTypes";
import { getNormalizedEnergyReadings } from "../data/energyData";
import { fetchHardwareReadings } from "./energyApi";

export type EnergyDataMode = "simulation" | "hardware";

export async function getEnergyReadings(
  mode: EnergyDataMode = "simulation",
): Promise<EnergyReading[]> {
  if (mode === "simulation") {
    return getNormalizedEnergyReadings();
  }

  return fetchHardwareReadings();
}
