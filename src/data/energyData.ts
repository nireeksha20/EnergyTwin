export type { EnergyReading } from "./energyTypes";

export type SimulatedEnergyReading = {
  time: string;
  hour: number;
  power: number;
  baseline: number;
  voltage: number;
  current: number;
  occupancy: number;
};

export const energyReadings: SimulatedEnergyReading[] = [
  {
    time: "00:00",
    hour: 0,
    power: 1.2,
    baseline: 1.4,
    voltage: 230,
    current: 5.2,
    occupancy: 0,
  },
  {
    time: "03:00",
    hour: 3,
    power: 1.0,
    baseline: 1.2,
    voltage: 229,
    current: 4.4,
    occupancy: 0,
  },
  {
    time: "06:00",
    hour: 6,
    power: 1.5,
    baseline: 1.6,
    voltage: 231,
    current: 6.5,
    occupancy: 0,
  },
  {
    time: "09:00",
    hour: 9,
    power: 4.8,
    baseline: 4.0,
    voltage: 230,
    current: 12.4,
    occupancy: 35,
  },
  {
    time: "12:00",
    hour: 12,
    power: 6.5,
    baseline: 4.5,
    voltage: 228,
    current: 16.2,
    occupancy: 42,
  },
  {
    time: "15:00",
    hour: 15,
    power: 5.4,
    baseline: 4.7,
    voltage: 230,
    current: 14.1,
    occupancy: 38,
  },
  {
    time: "18:00",
    hour: 18,
    power: 3.2,
    baseline: 3.5,
    voltage: 231,
    current: 9.2,
    occupancy: 8,
  },
  {
    time: "21:00",
    hour: 21,
    power: 1.7,
    baseline: 2.0,
    voltage: 230,
    current: 6.1,
    occupancy: 0,
  },
];

export type EnergyInsight = {
  id: string;
  time: string;
  severity: "high" | "medium" | "low";
  title: string;
  actual: number;
  baseline: number;
  deviationPercent: number;
  explanation: string;
  recommendation: string;
};

export function getEnergyInsights(): EnergyInsight[] {
  return energyReadings
    .map((reading): EnergyInsight | null => {
      const difference = reading.power - reading.baseline;
      const deviationPercent = (difference / reading.baseline) * 100;

      if (deviationPercent >= 40) {
        return {
          id: `energy-${reading.hour}`,
          time: reading.time,
          severity: "high",
          title: "Consumption significantly above baseline",
          actual: reading.power,
          baseline: reading.baseline,
          deviationPercent: Math.round(deviationPercent),
          explanation: `Illustrative power is ${reading.power.toFixed(1)} kW against a baseline of ${reading.baseline.toFixed(1)} kW.`,
          recommendation:
            "Review occupancy, equipment schedules and environmental conditions before deciding whether action is needed.",
        };
      }

      if (deviationPercent >= 15) {
        return {
          id: `energy-${reading.hour}`,
          time: reading.time,
          severity: "medium",
          title: "Energy demand above baseline",
          actual: reading.power,
          baseline: reading.baseline,
          deviationPercent: Math.round(deviationPercent),
          explanation: `Power is ${reading.power.toFixed(1)} kW, approximately ${Math.round(deviationPercent)}% above the illustrative baseline.`,
          recommendation:
            "Check whether the increase matches scheduled activities and the expected operation of major loads.",
        };
      }

      if (deviationPercent <= -15) {
        return {
          id: `energy-${reading.hour}`,
          time: reading.time,
          severity: "low",
          title: "Consumption below baseline",
          actual: reading.power,
          baseline: reading.baseline,
          deviationPercent: Math.round(deviationPercent),
          explanation: `Power is ${reading.power.toFixed(1)} kW, below the illustrative baseline of ${reading.baseline.toFixed(1)} kW.`,
          recommendation:
            "Continue collecting readings and confirm whether this lower demand is normal before updating the baseline.",
        };
      }

      return null;
    })
    .filter((insight): insight is EnergyInsight => insight !== null);
}

export function getEnergySummary() {
  const totalDeviation = energyReadings.reduce(
    (sum, reading) =>
      sum +
      Math.max(
        0,
        ((reading.power - reading.baseline) / reading.baseline) * 100,
      ),
    0,
  );

  const largestDeviation = Math.max(
    ...energyReadings.map(
      (reading) =>
        ((reading.power - reading.baseline) / reading.baseline) * 100,
    ),
  );

  return {
    averagePower:
      energyReadings.reduce((sum, reading) => sum + reading.power, 0) /
      energyReadings.length,
    largestDeviation: Math.round(largestDeviation),
    positiveDeviationAverage: Math.round(
      totalDeviation / energyReadings.length,
    ),
    estimatedDailyEnergy: energyReadings.reduce(
      (sum, reading, index, readings) => {
        if (index === 0) return sum;
        const hours = reading.hour - readings[index - 1].hour;
        return sum + readings[index - 1].power * hours;
      },
      0,
    ),
  };
}

import type { EnergyReading as NormalizedEnergyReading } from "./energyTypes";

export function getNormalizedEnergyReadings(): NormalizedEnergyReading[] {
  return energyReadings.map((reading) => ({
    timestamp: reading.time,
    power: reading.power,
    voltage: reading.voltage,
    current: reading.current,
    energy: 0,
    occupancy: reading.occupancy,
    temperature: null,
    humidity: null,
    source: "simulation",
  }));
}
