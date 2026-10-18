import { describe, it, expect } from "vitest";
import { scoreIsi, isiSeverity, type IsiAnswers } from "../isi";

describe("scoreIsi", () => {
  it("sums all 7 answers", () => {
    expect(scoreIsi([1, 2, 3, 0, 1, 2, 3])).toBe(12);
  });
  it("returns 0 for all zeros", () => {
    expect(scoreIsi([0, 0, 0, 0, 0, 0, 0])).toBe(0);
  });
  it("returns 28 for all fours", () => {
    expect(scoreIsi([4, 4, 4, 4, 4, 4, 4])).toBe(28);
  });
});

describe("isiSeverity", () => {
  it("none: 0–7", () => {
    expect(isiSeverity(0)).toBe("none");
    expect(isiSeverity(7)).toBe("none");
  });
  it("subthreshold: 8–14", () => {
    expect(isiSeverity(8)).toBe("subthreshold");
    expect(isiSeverity(14)).toBe("subthreshold");
  });
  it("moderate: 15–21", () => {
    expect(isiSeverity(15)).toBe("moderate");
    expect(isiSeverity(21)).toBe("moderate");
  });
  it("severe: 22–28", () => {
    expect(isiSeverity(22)).toBe("severe");
    expect(isiSeverity(28)).toBe("severe");
  });
});
