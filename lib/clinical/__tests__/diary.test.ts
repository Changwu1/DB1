import { describe, it, expect } from "vitest";
import { calcDiary, type DiaryInput } from "../diary";

const BASE: DiaryInput = {
  nightDate: "2026-10-18",
  timeIntoBed: "23:00",
  timeOutOfBed: "07:00",
  solMinutes: 15,
  wasoMinutes: 10,
  qualityRating: 3,
  loggedAt: new Date("2026-10-19T08:00:00Z"),
  userTimezone: "Asia/Bangkok",
};

describe("calcDiary — happy path", () => {
  it("calculates TIB, TST, SE correctly for overnight", () => {
    const result = calcDiary(BASE);
    if ("invalid" in result) throw new Error("Expected valid");
    expect(result.tibMinutes).toBe(480); // 8h
    expect(result.tstMinutes).toBe(455); // 480 - 15 - 10
    expect(result.sePercent).toBe(94.8);
  });
});

describe("calcDiary — same-day (no midnight cross)", () => {
  it("handles 22:00 → 06:00", () => {
    const result = calcDiary({ ...BASE, timeIntoBed: "22:00", timeOutOfBed: "06:00" });
    if ("invalid" in result) throw new Error("Expected valid");
    expect(result.tibMinutes).toBe(480);
  });
});

describe("calcDiary — validation", () => {
  it("rejects TIB < 2h", () => {
    const result = calcDiary({ ...BASE, timeIntoBed: "23:00", timeOutOfBed: "23:30" });
    if (!("invalid" in result)) throw new Error("Expected invalid");
    expect(result.reason).toBe("tib_too_short");
  });

  it("rejects TIB > 16h", () => {
    const result = calcDiary({ ...BASE, timeIntoBed: "06:00", timeOutOfBed: "23:00" });
    if (!("invalid" in result)) throw new Error("Expected invalid");
    expect(result.reason).toBe("tib_too_long");
  });

  it("rejects negative TST (sol+waso > tib)", () => {
    const result = calcDiary({ ...BASE, solMinutes: 400, wasoMinutes: 200 });
    if (!("invalid" in result)) throw new Error("Expected invalid");
    expect(result.reason).toBe("tst_negative");
  });

  it("rejects entries logged > 36h after night start", () => {
    const result = calcDiary({
      ...BASE,
      loggedAt: new Date("2026-10-21T00:00:00Z"),
    });
    if (!("invalid" in result)) throw new Error("Expected invalid");
    expect(result.reason).toBe("entry_too_late");
  });
});
