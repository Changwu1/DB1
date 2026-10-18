import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AssessmentWizard } from "@/components/assessment/AssessmentWizard";

export const instant = false;

export default async function AssessmentPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // If already completed, go to result
  const { data: assessment } = await supabase
    .from("assessment_1")
    .select("routing_decision, selfharm_flag_raised, selfharm_flagged_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (assessment?.routing_decision === "crisis_stop") redirect("/assessment/crisis");
  if (assessment?.routing_decision) redirect("/assessment/result");

  // Check 24h self-harm lockout
  if (assessment?.selfharm_flag_raised && assessment.selfharm_flagged_at) {
    const flaggedAt = new Date(assessment.selfharm_flagged_at);
    const lockoutEnd = new Date(flaggedAt.getTime() + 24 * 60 * 60 * 1000);
    if (new Date() < lockoutEnd) redirect("/assessment/crisis");
  }

  return (
    <main className="flex flex-1 flex-col">
      <AssessmentWizard />
    </main>
  );
}
