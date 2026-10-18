import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const instant = false;

export default async function LightTrackEscalatePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Mark escalation in light_track_progress
  await supabase
    .from("light_track_progress")
    .update({ outcome: "escalated_to_full", completed_at: new Date().toISOString() })
    .eq("user_id", user.id);

  // Update assessment routing_decision to full_track
  await supabase
    .from("assessment_1")
    .update({ routing_decision: "jinx_full_track" })
    .eq("user_id", user.id);

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center gap-6">
      <div className="text-6xl">🦊</div>
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Your sleep needs a bit more support.</h1>
        <p className="text-gray-600 leading-relaxed">
          Good news — you've built some solid habits. The full programme adds a personalised sleep schedule
          that makes a bigger difference for persistent insomnia.
        </p>
      </div>
      <a href="/full-track/intro" className="block w-full">
        <div className="rounded-2xl bg-indigo-600 px-6 py-4 text-white text-center font-semibold hover:bg-indigo-700 transition-colors">
          Start the full programme
        </div>
      </a>
      <a href="/light-track" className="text-sm text-gray-500 underline underline-offset-2">Stay on light track</a>
    </main>
  );
}
