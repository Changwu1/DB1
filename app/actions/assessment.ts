"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { trackEvent } from "@/lib/analytics";
import { scoreIsi, isiSeverity, type IsiAnswers } from "@/lib/clinical/isi";
import { computeRouting, resolveAfterClearance, type RedFlag, type Contraindication } from "@/lib/clinical/routing";
import type { InsomniaType, DurationLabel } from "@/lib/types/database";

// ── Helpers ──────────────────────────────────────────────────────────────────

async function getOrCreateAssessment(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("assessment_1")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (data) return data;

  const { data: created } = await supabase
    .from("assessment_1")
    .insert({ user_id: userId })
    .select()
    .single();
  return created;
}

// ── Step 1: Save ISI + type + duration ───────────────────────────────────────

export interface AssessmentStep1Data {
  isiAnswers: IsiAnswers;
  insomniaType: InsomniaType;
  durationLabel: DurationLabel;
}

export async function saveAssessmentStep1(data: AssessmentStep1Data): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const score = scoreIsi(data.isiAnswers);
  const severity = isiSeverity(score);

  await getOrCreateAssessment(user.id);

  await supabase.from("assessment_1").update({
    isi_score: score,
    severity_label: severity,
    insomnia_type: data.insomniaType,
    duration_label: data.durationLabel,
  }).eq("user_id", user.id);

  await trackEvent("assessment_step1_complete", user.id, { score, severity }, "/assessment");
}

// ── Step 2: Self-harm screen ──────────────────────────────────────────────────

export async function submitSelfharm(answer: string): Promise<{ crisis: boolean }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const isCrisis = answer !== "not_at_all";

  if (isCrisis) {
    await supabase.from("assessment_1").update({
      selfharm_flag_raised: true,
      selfharm_flagged_at: new Date().toISOString(),
      routing_decision: "crisis_stop",
      completed_at: new Date().toISOString(),
    }).eq("user_id", user.id);

    await trackEvent("selfharm_flag_raised", user.id, {}, "/assessment");
  }

  return { crisis: isCrisis };
}

// ── Step 3: Red flags + contraindications + routing ───────────────────────────

export interface AssessmentStep3Data {
  stopBangScore: number;
  restlessLegs: boolean;
  circadian: boolean;
  phq2Score: number;
  gad2Score: number;
  contraindications: Contraindication[];
}

export async function finalizeAssessment(data: AssessmentStep3Data): Promise<{ routing: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const assessment = await supabase
    .from("assessment_1")
    .select("severity_label, duration_label")
    .eq("user_id", user.id)
    .single();

  if (!assessment.data?.severity_label || !assessment.data?.duration_label) {
    throw new Error("Assessment step 1 not complete");
  }

  const redFlags: RedFlag[] = [];
  if (data.stopBangScore >= 3) redFlags.push("stop_bang");
  if (data.restlessLegs) redFlags.push("restless_legs");
  if (data.circadian) redFlags.push("circadian");
  if (data.phq2Score >= 3 || data.gad2Score >= 3) redFlags.push("mood");

  const routing = computeRouting({
    severity: assessment.data.severity_label,
    duration: assessment.data.duration_label,
    redFlags,
    contraindications: data.contraindications,
  });

  await supabase.from("assessment_1").update({
    red_flags: redFlags,
    contraindications: data.contraindications,
    routing_decision: routing,
    completed_at: routing !== "referral_gated" ? new Date().toISOString() : null,
  }).eq("user_id", user.id);

  await trackEvent("assessment_complete", user.id, { routing }, "/assessment");

  return { routing };
}

// ── Referral clearance attestation ───────────────────────────────────────────

export async function attestClearance(): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const assessment = await supabase
    .from("assessment_1")
    .select("severity_label, duration_label, contraindications, red_flags")
    .eq("user_id", user.id)
    .single();

  if (!assessment.data) throw new Error("No assessment found");

  const routing = resolveAfterClearance({
    severity: assessment.data.severity_label!,
    duration: assessment.data.duration_label!,
    redFlags: (assessment.data.red_flags as RedFlag[]) ?? [],
    contraindications: (assessment.data.contraindications as Contraindication[]) ?? [],
  });

  await supabase.from("assessment_1").update({
    cleared_flags: assessment.data.red_flags,
    clearance_attested_at: new Date().toISOString(),
    routing_decision: routing,
    completed_at: new Date().toISOString(),
  }).eq("user_id", user.id);

  await trackEvent("referral_clearance_attested", user.id, { routing }, "/assessment/clearance");
  redirect(`/assessment/result`);
}
