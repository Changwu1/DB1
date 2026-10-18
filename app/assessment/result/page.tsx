import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { strings } from "@/strings/en";
import { Button } from "@/components/ui/Button";

export const instant = false;

const s = strings.assessment.routing;

export default async function AssessmentResultPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: assessment } = await supabase
    .from("assessment_1")
    .select("isi_score, severity_label, routing_decision")
    .eq("user_id", user.id)
    .single();

  if (!assessment?.routing_decision || assessment.routing_decision === "referral_gated") {
    redirect("/assessment");
  }

  const { routing_decision: routing, isi_score, severity_label } = assessment;

  if (routing === "crisis_stop") redirect("/assessment/crisis");
  if (routing === "circadian_not_supported_v1") {
    return <CircadianScreen />;
  }
  if (routing === "tips_only") {
    return <TipsOnlyScreen isiScore={isi_score ?? 0} />;
  }

  const isLight = routing === "jinx_light_track";
  const severityLabel = severity_label
    ? s.complete.isiBandLabels[severity_label as keyof typeof s.complete.isiBandLabels]
    : "";

  return (
    <main className="flex flex-1 flex-col px-6 py-10 gap-6">
      <div className="text-center flex flex-col gap-2 pt-4">
        <span className="text-5xl">🌙</span>
        <h1 className="text-2xl font-bold text-gray-900">{s.complete.title}</h1>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">ISI Score</span>
          <span className="text-2xl font-bold text-indigo-600">{isi_score ?? "—"}</span>
        </div>
        <div className="h-px bg-gray-100" />
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Assessment</span>
          <span className="text-sm font-medium text-gray-800">{severityLabel}</span>
        </div>
        <div className="h-px bg-gray-100" />
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Programme</span>
          <span className="text-sm font-medium text-indigo-600">
            {isLight ? "Jinx Light Track" : "Jinx Full Programme"}
          </span>
        </div>
      </div>

      {isLight ? (
        <p className="text-sm text-gray-600 text-center">
          Your sleep has been off for a while, but good news — short-term sleep problems respond really well to a few habit changes.
        </p>
      ) : (
        <p className="text-sm text-gray-600 text-center">
          You're a good candidate for a full CBT-I programme. We'll start by understanding your sleep patterns over the next 7–14 days.
        </p>
      )}

      <a href={isLight ? "/light-track/intro" : "/full-track/intro"} className="block">
        <Button fullWidth>
          {isLight ? s.complete.continueCtaLight : s.complete.continueCtaFull}
        </Button>
      </a>
    </main>
  );
}

function CircadianScreen() {
  const s = strings.assessment.routing.circadianNotSupported;
  return (
    <main className="flex flex-1 flex-col px-6 py-10 gap-6">
      <div className="text-center flex flex-col gap-3 pt-4">
        <span className="text-4xl">🌅</span>
        <h1 className="text-xl font-bold text-gray-900">{s.title}</h1>
        <p className="text-gray-600 text-sm leading-relaxed">{s.body}</p>
      </div>
      <div className="rounded-2xl bg-indigo-50 border border-indigo-200 p-4">
        <p className="text-sm text-indigo-800 font-medium mb-1">Try this:</p>
        <p className="text-sm text-indigo-700">{s.tip}</p>
      </div>
      <a href="/" className="text-center text-sm text-gray-500 underline underline-offset-2">
        Back to home
      </a>
    </main>
  );
}

function TipsOnlyScreen({ isiScore }: { isiScore: number }) {
  const s = strings.assessment.routing.tipsOnly;
  return (
    <main className="flex flex-1 flex-col px-6 py-10 gap-6">
      <div className="text-center flex flex-col gap-3 pt-4">
        <span className="text-5xl">✨</span>
        <h1 className="text-xl font-bold text-gray-900">{s.title}</h1>
        <p className="text-sm text-gray-500">ISI Score: {isiScore}</p>
        <p className="text-gray-600 text-sm leading-relaxed">{s.body}</p>
      </div>
      <a href="/" className="text-center text-sm text-gray-500 underline underline-offset-2">
        Back to home
      </a>
    </main>
  );
}
