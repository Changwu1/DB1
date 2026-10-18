import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const instant = false;

export default async function LightTrackCompletePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: progress } = await supabase
    .from("light_track_progress")
    .select("isi_week4_score, outcome")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center gap-6">
      <div className="text-7xl">🎉</div>
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold text-gray-900">You did it.</h1>
        <p className="text-gray-600 leading-relaxed">
          You've completed 4 weeks with Jinx.
          {progress?.isi_week4_score !== null && progress?.isi_week4_score !== undefined && (
            <> Your ISI score is now <strong>{progress.isi_week4_score}</strong> — {
              progress.isi_week4_score < 8 ? "that's remission!" :
              progress.isi_week4_score < 15 ? "still some room to improve." :
              "let's talk about next steps."
            }</>
          )}
        </p>
      </div>
      <div className="rounded-2xl bg-indigo-50 border border-indigo-200 p-4 text-left w-full">
        <p className="text-sm text-indigo-700">
          Keep your consistent wake time going. That's the single most powerful habit for long-term sleep health.
        </p>
      </div>
      <a href="/" className="text-sm text-gray-500 underline underline-offset-2">Back to home</a>
    </main>
  );
}
