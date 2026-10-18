import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { strings } from "@/strings/en";
import { Button } from "@/components/ui/Button";
import { getTipForDay } from "@/lib/content/sleepTips";
import { getCognitiveItemForDay } from "@/lib/content/cognitiveContent";
import { daysElapsed, lightTrackWeek, isiRecheckDue } from "@/lib/clinical/lightTrack";
import { resumeAfterDormant } from "@/app/actions/lightTrack";

export const instant = false;

const s = strings;

export default async function LightTrackPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: progress } = await supabase
    .from("light_track_progress")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!progress) redirect("/light-track/intro");
  if (progress.completed_at) redirect("/light-track/complete");

  const now = new Date();
  const days = daysElapsed(progress.started_at, now);
  const week = lightTrackWeek(days);
  const todayStr = now.toISOString().split("T")[0];
  const checkedInToday = progress.last_checkin_date === todayStr;

  const recheckDue = isiRecheckDue(
    days,
    progress.isi_week2_score !== null,
    progress.isi_week4_score !== null
  );

  const tip = getTipForDay(new Date(progress.started_at), now);
  const cogItem = getCognitiveItemForDay(days);

  // Dormant user check
  const isDormant = progress.plan_frozen;

  if (isDormant) {
    return (
      <main className="flex flex-1 flex-col px-6 py-10 gap-6 items-center text-center">
        <div className="text-5xl pt-6">🦊</div>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-gray-900">{s.dormant.reengagementTitle}</h1>
          <p className="text-gray-600">{s.dormant.reengagementBody}</p>
        </div>
        <form action={resumeAfterDormant} className="w-full">
          <Button type="submit" fullWidth>{s.dormant.reengagementCta}</Button>
        </form>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col px-6 py-8 gap-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide">Week {week} · Day {days + 1}</p>
          <h1 className="text-xl font-bold text-gray-900 mt-0.5">Good{getTimeOfDay()}, {user.email?.split("@")[0]}</h1>
        </div>
        <span className="text-3xl">🦊</span>
      </div>

      {/* ISI re-check — shown when due */}
      {recheckDue && (
        <div className="rounded-2xl border border-indigo-300 bg-indigo-50 p-4">
          <p className="text-sm font-semibold text-indigo-800 mb-1">
            Time for a quick check-in — Week {recheckDue}
          </p>
          <p className="text-sm text-indigo-700 mb-3">
            Let's see how your sleep has been improving. It takes about 2 minutes.
          </p>
          <Link href={`/light-track/isi-check?week=${recheckDue}`}>
            <Button fullWidth>Take ISI survey</Button>
          </Link>
        </div>
      )}

      {/* Daily check-in */}
      <div className={`rounded-2xl border p-4 ${checkedInToday ? "border-green-200 bg-green-50" : "border-gray-200 bg-white"}`}>
        <div className="flex justify-between items-center mb-3">
          <p className="text-sm font-semibold text-gray-800">How did you sleep?</p>
          {checkedInToday && <span className="text-xs text-green-600 font-medium">Done ✓</span>}
        </div>
        {checkedInToday ? (
          <p className="text-sm text-gray-500">Great — see you tomorrow.</p>
        ) : (
          <Link href="/light-track/checkin">
            <Button fullWidth variant="secondary">Rate last night</Button>
          </Link>
        )}
      </div>

      {/* Sleep tip */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">
          {s.diary.hygieneTipTitle}
        </p>
        <p className="text-sm font-semibold text-amber-900 mb-1">{tip.title}</p>
        <p className="text-sm text-amber-800 leading-relaxed">{tip.body}</p>
      </div>

      {/* Cognitive content */}
      {cogItem.type === "thought_card" ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 flex flex-col gap-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Thought challenge</p>
          <p className="text-sm font-medium text-gray-800 italic">"{cogItem.content.belief}"</p>
          <div className="flex flex-col gap-2 border-t border-gray-100 pt-3">
            <p className="text-sm text-gray-600">➊ {cogItem.content.counterQ1}</p>
            <p className="text-sm text-gray-600">➋ {cogItem.content.counterQ2}</p>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 flex flex-col gap-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Constructive worry</p>
          <p className="text-sm text-gray-700 leading-relaxed">{cogItem.content.instruction}</p>
        </div>
      )}
    </main>
  );
}

function getTimeOfDay(): string {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}
