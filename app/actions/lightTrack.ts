"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { trackEvent } from "@/lib/analytics";
import { scoreIsi, isiSeverity } from "@/lib/clinical/isi";
import { lightTrackReassessmentOutcome } from "@/lib/clinical/lightTrack";
import type { IsiAnswers } from "@/lib/clinical/isi";

export async function startLightTrack(): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: existing } = await supabase
    .from("light_track_progress")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!existing) {
    await supabase.from("light_track_progress").insert({ user_id: user.id });
  }

  await trackEvent("light_track_started", user.id, {}, "/light-track/intro");
  redirect("/light-track");
}

export async function submitLightCheckin(qualityRating: number): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const todayStr = new Date().toISOString().split("T")[0];

  await supabase.from("light_track_progress").update({
    last_checkin_at: new Date().toISOString(),
    last_checkin_date: todayStr,
    consecutive_missed_checkins: 0,
    plan_frozen: false,
  }).eq("user_id", user.id);

  await trackEvent("light_track_checkin", user.id, { quality_rating: qualityRating }, "/light-track/checkin");
}

export async function resumeAfterDormant(): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  await supabase.from("light_track_progress").update({
    plan_frozen: false,
    consecutive_missed_checkins: 0,
  }).eq("user_id", user.id);

  await trackEvent("light_track_resumed", user.id, {}, "/light-track");
  redirect("/light-track");
}

export async function submitLightIsi(
  weekNumber: 2 | 4,
  isiAnswers: IsiAnswers
): Promise<{ outcome: string | null; needsEscalation: boolean }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const score = scoreIsi(isiAnswers);
  const now = new Date().toISOString();

  const { data: a1 } = await supabase
    .from("assessment_1")
    .select("isi_score")
    .eq("user_id", user.id)
    .single();

  const outcome = lightTrackReassessmentOutcome(score);
  const needsEscalation = outcome === "escalate";

  if (weekNumber === 2) {
    await supabase.from("light_track_progress").update({
      isi_week2_score: score,
      isi_week2_at: now,
      ...(outcome === "remission" ? { outcome: "remission" as const, completed_at: now } : {}),
      ...(needsEscalation ? { outcome: "escalated_to_full" as const } : {}),
    }).eq("user_id", user.id);
  } else {
    await supabase.from("light_track_progress").update({
      isi_week4_score: score,
      isi_week4_at: now,
      ...(outcome === "remission" ? { outcome: "remission" as const, completed_at: now } : {}),
      ...(needsEscalation ? { outcome: "escalated_to_full" as const } : {}),
    }).eq("user_id", user.id);
  }

  await supabase.from("isi_reassessments").insert({
    user_id: user.id,
    score,
    baseline_score: a1?.isi_score ?? null,
    week_number: weekNumber,
    track: "light",
  });

  await trackEvent("isi_reassessment", user.id, { score, week: weekNumber, track: "light" }, "/light-track/isi-check");

  return { outcome, needsEscalation };
}
