import { describe, it, expect } from "vitest";
import {
  lightTrackReassessmentOutcome,
  isSelfharmLockoutActive,
  daysElapsed,
  lightTrackWeek,
  isiRecheckDue,
} from "../lightTrack";

describe("lightTrackReassessmentOutcome", () => {
  it("remission when ISI < 8", () => {
    expect(lightTrackReassessmentOutcome(7)).toBe("remission");
    expect(lightTrackReassessmentOutcome(0)).toBe("remission");
  });

  it("continue when ISI 8–14", () => {
    expect(lightTrackReassessmentOutcome(8)).toBe("continue");
    expect(lightTrackReassessmentOutcome(14)).toBe("continue");
  });

  it("escalate when ISI ≥ 15", () => {
    expect(lightTrackReassessmentOutcome(15)).toBe("escalate");
    expect(lightTrackReassessmentOutcome(28)).toBe("escalate");
  });
});

describe("isSelfharmLockoutActive", () => {
  it("active when < 24h after flag", () => {
    const flaggedAt = new Date("2026-10-18T10:00:00Z").toISOString();
    const now = new Date("2026-10-18T20:00:00Z");
    expect(isSelfharmLockoutActive(flaggedAt, now)).toBe(true);
  });

  it("active at exactly 23h 59m", () => {
    const flaggedAt = new Date("2026-10-18T10:00:00Z").toISOString();
    const now = new Date("2026-10-19T09:59:00Z");
    expect(isSelfharmLockoutActive(flaggedAt, now)).toBe(true);
  });

  it("inactive when exactly 24h have elapsed", () => {
    const flaggedAt = new Date("2026-10-18T10:00:00Z").toISOString();
    const now = new Date("2026-10-19T10:00:00Z");
    expect(isSelfharmLockoutActive(flaggedAt, now)).toBe(false);
  });

  it("inactive when > 24h have elapsed", () => {
    const flaggedAt = new Date("2026-10-18T10:00:00Z").toISOString();
    const now = new Date("2026-10-20T00:00:00Z");
    expect(isSelfharmLockoutActive(flaggedAt, now)).toBe(false);
  });
});

describe("isiRecheckDue", () => {
  it("week 2 check due at day 14 when not done", () => {
    expect(isiRecheckDue(14, false, false)).toBe(2);
    expect(isiRecheckDue(20, false, false)).toBe(2);
  });

  it("week 4 check takes priority at day 28", () => {
    expect(isiRecheckDue(28, true, false)).toBe(4);
    expect(isiRecheckDue(35, true, false)).toBe(4);
  });

  it("no check due when both done", () => {
    expect(isiRecheckDue(35, true, true)).toBe(false);
  });

  it("no check due before day 14", () => {
    expect(isiRecheckDue(13, false, false)).toBe(false);
  });

  it("week 4 before week 2 done: still returns 4", () => {
    expect(isiRecheckDue(28, false, false)).toBe(4);
  });
});

describe("lightTrackWeek", () => {
  it("week 1 on days 0-6", () => {
    expect(lightTrackWeek(0)).toBe(1);
    expect(lightTrackWeek(6)).toBe(1);
  });
  it("week 2 on days 7-13", () => {
    expect(lightTrackWeek(7)).toBe(2);
    expect(lightTrackWeek(13)).toBe(2);
  });
  it("caps at week 4", () => {
    expect(lightTrackWeek(100)).toBe(4);
  });
});
