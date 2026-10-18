export type LightTrackReassessmentOutcome = "remission" | "continue" | "escalate";

// Pure function — testable without DB.
export function lightTrackReassessmentOutcome(
  currentScore: number
): LightTrackReassessmentOutcome {
  if (currentScore < 8) return "remission";
  if (currentScore >= 15) return "escalate";
  return "continue";
}

// Pure function — self-harm lockout check.
export function isSelfharmLockoutActive(flaggedAt: string, now: Date): boolean {
  const flagged = new Date(flaggedAt);
  const lockoutEnd = new Date(flagged.getTime() + 24 * 60 * 60 * 1000);
  return now < lockoutEnd;
}

// Days elapsed since a start date (floor).
export function daysElapsed(startedAt: string, now: Date): number {
  const start = new Date(startedAt);
  return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

// Which week (1-4+) of the light track are we on?
export function lightTrackWeek(daysIn: number): number {
  return Math.min(Math.floor(daysIn / 7) + 1, 4);
}

// Is ISI re-check due? True when we've hit week 2 (day≥14) or week 4 (day≥28)
// and the re-check hasn't been done yet.
export function isiRecheckDue(
  daysIn: number,
  week2Done: boolean,
  week4Done: boolean
): false | 2 | 4 {
  if (daysIn >= 28 && !week4Done) return 4;
  if (daysIn >= 14 && !week2Done) return 2;
  return false;
}
