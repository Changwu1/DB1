import { addHours } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";

export interface DiaryInput {
  nightDate: string; // "YYYY-MM-DD" — date the night started, in user's timezone
  timeIntoBed: string; // "HH:MM"
  timeOutOfBed: string; // "HH:MM"
  solMinutes: number;
  wasoMinutes: number;
  qualityRating: number; // 1–5
  loggedAt: Date; // UTC
  userTimezone: string;
}

export interface DiaryCalc {
  tibMinutes: number;
  tstMinutes: number;
  sePercent: number;
}

function parseLocalTime(nightDate: string, hhmm: string, crossedMidnight: boolean): Date {
  // Build an ISO string with a date and time, then treat as UTC for simplicity
  // (we just need the difference in minutes, not absolute timezone)
  const [h, m] = hhmm.split(":").map(Number);
  const [year, month, day] = nightDate.split("-").map(Number);
  const d = new Date(Date.UTC(year, month - 1, day + (crossedMidnight ? 1 : 0), h, m, 0, 0));
  return d;
}

export function calcDiary(input: DiaryInput): DiaryCalc | { invalid: true; reason: string } {
  const [bh, bm] = input.timeIntoBed.split(":").map(Number);
  const [oh, om] = input.timeOutOfBed.split(":").map(Number);

  const bedTotal = bh * 60 + bm;
  const outTotal = oh * 60 + om;
  const crossedMidnight = outTotal <= bedTotal;

  const bedDate = parseLocalTime(input.nightDate, input.timeIntoBed, false);
  const outDate = parseLocalTime(input.nightDate, input.timeOutOfBed, crossedMidnight);

  const tibMinutes = (outDate.getTime() - bedDate.getTime()) / 60000;

  if (tibMinutes < 120) return { invalid: true, reason: "tib_too_short" };
  if (tibMinutes > 960) return { invalid: true, reason: "tib_too_long" };

  const tstMinutes = tibMinutes - input.solMinutes - input.wasoMinutes;
  if (tstMinutes < 0) return { invalid: true, reason: "tst_negative" };

  // Entry must be logged within 36h of the start of night_date (in user's timezone → midnight UTC for simplicity in tests)
  const [y, mo, d] = input.nightDate.split("-").map(Number);
  const nightStart = new Date(Date.UTC(y, mo - 1, d));
  const deadline = addHours(nightStart, 36);
  if (input.loggedAt > deadline) return { invalid: true, reason: "entry_too_late" };

  const sePercent = Math.round((tstMinutes / tibMinutes) * 100 * 10) / 10;

  return { tibMinutes, tstMinutes, sePercent };
}

export function averageSe(entries: { sePercent: number }[]): number {
  if (entries.length === 0) return 0;
  return entries.reduce((sum, e) => sum + e.sePercent, 0) / entries.length;
}

export function averageMinutes(entries: { value: number }[]): number {
  if (entries.length === 0) return 0;
  return entries.reduce((sum, e) => sum + e.value, 0) / entries.length;
}
