import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { startLightTrack } from "@/app/actions/lightTrack";
import { Button } from "@/components/ui/Button";
import { strings } from "@/strings/en";

export const instant = false;

const s = strings.jinx.lightTrackIntro;

export default async function LightTrackIntroPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // If already started, skip to the main light track page
  const { data: progress } = await supabase
    .from("light_track_progress")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (progress) redirect("/light-track");

  return (
    <main className="flex flex-1 flex-col items-center justify-between px-6 py-12 text-center">
      <div className="flex flex-col items-center gap-6 pt-8">
        <div className="text-7xl select-none">🦊</div>
        <div className="flex flex-col gap-3">
          <h1 className="text-2xl font-bold text-gray-900">{s.title}</h1>
          <p className="text-gray-600 leading-relaxed">{s.body}</p>
        </div>
        <div className="rounded-2xl bg-indigo-50 border border-indigo-200 p-4 w-full text-left">
          <p className="text-sm text-indigo-700">
            <strong>4 weeks.</strong> One tip and one exercise every day. No complicated rules.
          </p>
        </div>
      </div>

      <form action={startLightTrack} className="w-full mt-8">
        <Button type="submit" fullWidth>{s.cta}</Button>
      </form>
    </main>
  );
}
