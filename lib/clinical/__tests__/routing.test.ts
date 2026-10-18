import { describe, it, expect } from "vitest";
import { computeRouting, type RoutingInput } from "../routing";

function input(overrides: Partial<RoutingInput> = {}): RoutingInput {
  return {
    severity: "moderate",
    duration: "chronic",
    redFlags: [],
    contraindications: [],
    ...overrides,
  };
}

describe("computeRouting", () => {
  it("crisis_stop on selfharm flag", () => {
    expect(computeRouting(input({ redFlags: ["selfharm"] }))).toBe("crisis_stop");
  });

  it("circadian_not_supported_v1 on circadian flag", () => {
    expect(computeRouting(input({ redFlags: ["circadian"] }))).toBe("circadian_not_supported_v1");
  });

  it("circadian takes priority over stop_bang", () => {
    expect(computeRouting(input({ redFlags: ["circadian", "stop_bang"] }))).toBe("circadian_not_supported_v1");
  });

  it("referral_gated on stop_bang ≥ 3", () => {
    expect(computeRouting(input({ redFlags: ["stop_bang"] }))).toBe("referral_gated");
  });

  it("referral_gated on restless legs", () => {
    expect(computeRouting(input({ redFlags: ["restless_legs"] }))).toBe("referral_gated");
  });

  it("tips_only for ISI none severity", () => {
    expect(computeRouting(input({ severity: "none" }))).toBe("tips_only");
  });

  it("jinx_light_track for subthreshold + acute", () => {
    expect(computeRouting(input({ severity: "subthreshold", duration: "acute" }))).toBe("jinx_light_track");
  });

  it("jinx_full_track for subthreshold + chronic", () => {
    expect(computeRouting(input({ severity: "subthreshold", duration: "chronic" }))).toBe("jinx_full_track");
  });

  it("jinx_full_track for moderate + acute", () => {
    expect(computeRouting(input({ severity: "moderate", duration: "acute" }))).toBe("jinx_full_track");
  });

  it("jinx_full_track for moderate + chronic", () => {
    expect(computeRouting(input({ severity: "moderate", duration: "chronic" }))).toBe("jinx_full_track");
  });

  it("jinx_full_track for severe regardless of duration", () => {
    expect(computeRouting(input({ severity: "severe", duration: "acute" }))).toBe("jinx_full_track");
    expect(computeRouting(input({ severity: "severe", duration: "chronic" }))).toBe("jinx_full_track");
  });

  it("mood soft flag does not change routing", () => {
    expect(computeRouting(input({ redFlags: ["mood"], severity: "subthreshold", duration: "acute" }))).toBe("jinx_light_track");
  });

  it("selfharm beats circadian", () => {
    expect(computeRouting(input({ redFlags: ["selfharm", "circadian"] }))).toBe("crisis_stop");
  });
});
