import type { InsomniaSeverity, InsomniaType, DurationLabel, RoutingDecision } from "@/lib/types/database";

export type RedFlag =
  | "selfharm"
  | "stop_bang"
  | "restless_legs"
  | "circadian"
  | "mood";

export type Contraindication =
  | "bipolar_or_seizure"
  | "pregnancy_or_high_risk_occupation";

export interface RoutingInput {
  severity: InsomniaSeverity;
  duration: DurationLabel;
  redFlags: RedFlag[];
  contraindications: Contraindication[];
}

export function computeRouting(input: RoutingInput): RoutingDecision {
  // Hard stops first
  if (input.redFlags.includes("selfharm")) return "crisis_stop";
  if (input.redFlags.includes("circadian")) return "circadian_not_supported_v1";

  // Referral gate — proceed to full track after clearance
  if (
    input.redFlags.includes("stop_bang") ||
    input.redFlags.includes("restless_legs")
  ) {
    return "referral_gated";
  }

  // Tips only — no clinical insomnia
  if (input.severity === "none") return "tips_only";

  // Light track — subthreshold AND acute
  if (input.severity === "subthreshold" && input.duration === "acute") {
    return "jinx_light_track";
  }

  // Full track — everything else (subthreshold+chronic, moderate, severe)
  return "jinx_full_track";
}

// After referral clearance, resolve to actual treatment track
export function resolveAfterClearance(input: Omit<RoutingInput, "redFlags"> & { redFlags: RedFlag[] }): RoutingDecision {
  const withoutReferralFlags = {
    ...input,
    redFlags: input.redFlags.filter((f) => f !== "stop_bang" && f !== "restless_legs"),
  };
  const base = computeRouting(withoutReferralFlags);
  // After clearance, tips_only and light_track are still valid
  return base;
}
