import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { isSelfharmLockoutActive } from "@/lib/clinical/lightTrack";
import { strings } from "@/strings/en";

export const instant = false;

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/signup");

  const { data: profile } = await supabase
    .from("profiles")
    .select("disclaimer_acknowledged_at, consent_at, nickname")
    .eq("id", user.id)
    .single();

  if (!profile?.disclaimer_acknowledged_at) redirect("/onboarding/disclaimer");
  if (!profile?.consent_at) redirect("/onboarding/consent");

  const { data: assessment } = await supabase
    .from("assessment_1")
    .select("routing_decision, selfharm_flag_raised, selfharm_flagged_at")
    .eq("user_id", user.id)
    .maybeSingle();

  // Self-harm lockout: show crisis numbers on home during lockout
  const isInLockout =
    assessment?.selfharm_flag_raised &&
    assessment.selfharm_flagged_at &&
    isSelfharmLockoutActive(assessment.selfharm_flagged_at, new Date());

  if (!assessment?.routing_decision) redirect("/assessment");

  const routing = assessment.routing_decision;

  // Route to the right track
  if (routing === "jinx_light_track") redirect("/light-track");
  if (routing === "jinx_full_track") redirect("/full-track/intro");
  if (routing === "crisis_stop" && isInLockout) {
    return <CrisisHomeScreen nickname={profile.nickname} />;
  }
  if (routing === "crisis_stop") redirect("/assessment");
  if (routing === "referral_gated") redirect("/assessment/clearance");

  // tips_only and circadian_not_supported_v1 show result screen
  redirect("/assessment/result");
}

function CrisisHomeScreen({ nickname }: { nickname: string }) {
  const s = strings.crisis;
  return (
    <main className="flex flex-1 flex-col px-6 py-10 gap-6">
      <div className="pt-4">
        <h1 className="text-xl font-bold text-gray-900">Hi {nickname}.</h1>
      </div>
      <div className="rounded-2xl bg-red-50 border border-red-200 p-5 flex flex-col gap-3">
        <p className="text-sm font-semibold text-red-800">{s.homeNotice}</p>
        <div className="flex gap-3">
          <a
            href="tel:1323"
            className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-white text-center text-sm font-bold hover:bg-red-700"
          >
            Call 1323
          </a>
          <a
            href="tel:1669"
            className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-white text-center text-sm font-bold hover:bg-red-700"
          >
            Call 1669
          </a>
        </div>
      </div>
      <p className="text-sm text-gray-500 text-center">
        You can retry the assessment after 24 hours.
      </p>
    </main>
  );
}
