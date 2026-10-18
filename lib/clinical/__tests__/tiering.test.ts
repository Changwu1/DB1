import { describe, it, expect } from "vitest";
import { assignTier, adjustSleepWindow, prescribeInitialWindow, type TieringInput } from "../tiering";

function input(overrides: Partial<TieringInput> = {}): TieringInput {
  return {
    severity: "moderate",
    avgSe: 75,
    essScore: null,
    moodFlag: false,
    contraindications: [],
    ...overrides,
  };
}

describe("assignTier", () => {
  it("Tier 3 for severe ISI", () => {
    expect(assignTier(input({ severity: "severe" }))).toBe(3);
  });

  it("Tier 3 for ESS > 10", () => {
    expect(assignTier(input({ severity: "subthreshold", avgSe: 85, essScore: 11 }))).toBe(3);
  });

  it("Tier 3 for mood flag", () => {
    expect(assignTier(input({ severity: "subthreshold", avgSe: 85, moodFlag: true }))).toBe(3);
  });

  it("Tier 3 for pregnancy/high-risk occupation", () => {
    expect(assignTier(input({ severity: "subthreshold", avgSe: 85, contraindications: ["pregnancy_or_high_risk_occupation"] }))).toBe(3);
  });

  it("Tier 2 for moderate ISI", () => {
    expect(assignTier(input({ severity: "moderate", avgSe: 85 }))).toBe(2);
  });

  it("Tier 2 for SE < 80%", () => {
    expect(assignTier(input({ severity: "subthreshold", avgSe: 72 }))).toBe(2);
  });

  it("Tier 1 for subthreshold + SE ≥ 80", () => {
    expect(assignTier(input({ severity: "subthreshold", avgSe: 82 }))).toBe(1);
  });

  it("bipolar/seizure caps to Tier 1 regardless", () => {
    expect(assignTier(input({ severity: "severe", contraindications: ["bipolar_or_seizure"] }))).toBe(1);
    expect(assignTier(input({ avgSe: 72, contraindications: ["bipolar_or_seizure"] }))).toBe(1);
  });

  it("pregnancy overrides Tier 2 to Tier 3", () => {
    expect(assignTier(input({ severity: "moderate", avgSe: 72, contraindications: ["pregnancy_or_high_risk_occupation"] }))).toBe(3);
  });

  it("bipolar takes precedence over pregnancy", () => {
    expect(
      assignTier(
        input({
          severity: "severe",
          contraindications: ["bipolar_or_seizure", "pregnancy_or_high_risk_occupation"],
        })
      )
    ).toBe(1);
  });
});

describe("adjustSleepWindow", () => {
  const base = {
    avgTstMinutes: 360,
    currentWindowMinutes: 390,
    expansionStepMinutes: 15,
    contractionStepMinutes: 15,
    floorMinutes: 300,
    expansionTrigger: 85,
    contractionTrigger: 80,
  };

  it("expands when SE ≥ expansion trigger", () => {
    expect(adjustSleepWindow({ ...base, avgSePercent: 86 })).toBe(405);
  });

  it("contracts when SE < contraction trigger", () => {
    expect(adjustSleepWindow({ ...base, avgSePercent: 78 })).toBe(375);
  });

  it("holds when SE is between triggers", () => {
    expect(adjustSleepWindow({ ...base, avgSePercent: 82 })).toBe(390);
  });

  it("never contracts below floor", () => {
    expect(adjustSleepWindow({ ...base, currentWindowMinutes: 305, avgSePercent: 70 })).toBe(300);
  });
});

describe("prescribeInitialWindow", () => {
  it("TST + 30 min, floored", () => {
    expect(prescribeInitialWindow(360, 300)).toBe(390);
  });
  it("uses floor when TST + 30 < floor", () => {
    expect(prescribeInitialWindow(240, 300)).toBe(300);
  });
});
