import type { InsomniaSeverity } from "@/lib/types/database";
import type { Contraindication } from "./routing";

export type Tier = 1 | 2 | 3;

export interface TieringInput {
  severity: InsomniaSeverity;
  avgSe: number;
  essScore: number | null;
  moodFlag: boolean;
  contraindications: Contraindication[];
}

export function assignTier(input: TieringInput): Tier {
  // Step 1: standard evaluation (Tier 3 → 2 → 1, first match wins)
  let tier: Tier;

  if (
    input.severity === "severe" ||
    (input.essScore !== null && input.essScore > 10) ||
    input.moodFlag ||
    input.contraindications.includes("pregnancy_or_high_risk_occupation")
  ) {
    tier = 3;
  } else if (input.severity === "moderate" || input.avgSe < 80) {
    tier = 2;
  } else {
    tier = 1;
  }

  // Step 2: apply contraindication caps
  if (input.contraindications.includes("bipolar_or_seizure")) {
    tier = 1;
  } else if (
    input.contraindications.includes("pregnancy_or_high_risk_occupation") &&
    tier === 2
  ) {
    tier = 3;
  }

  return tier;
}

export interface SleepWindowInput {
  avgTstMinutes: number;
  currentWindowMinutes: number;
  avgSePercent: number;
  expansionStepMinutes: number;
  contractionStepMinutes: number;
  floorMinutes: number;
  expansionTrigger: number; // e.g. 85
  contractionTrigger: number; // e.g. 80
}

export function adjustSleepWindow(input: SleepWindowInput): number {
  if (input.avgSePercent >= input.expansionTrigger) {
    return input.currentWindowMinutes + input.expansionStepMinutes;
  }
  if (input.avgSePercent < input.contractionTrigger) {
    return Math.max(input.currentWindowMinutes - input.contractionStepMinutes, input.floorMinutes);
  }
  return input.currentWindowMinutes;
}

export function prescribeInitialWindow(avgTstMinutes: number, floorMinutes: number): number {
  return Math.max(avgTstMinutes + 30, floorMinutes);
}
