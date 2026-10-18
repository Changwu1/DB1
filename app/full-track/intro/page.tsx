import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { strings } from "@/strings/en";

export const instant = false;

const s = strings.jinx.fullTrackIntro;

export default async function FullTrackIntroPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  return (
    <main className="flex flex-1 flex-col items-center justify-between px-6 py-12 text-center">
      <div className="flex flex-col items-center gap-6 pt-8">
        <div className="text-7xl select-none">🦊</div>
        <div className="flex flex-col gap-3">
          <h1 className="text-2xl font-bold text-gray-900">{s.title}</h1>
          <p className="text-gray-600 leading-relaxed">{s.body}</p>
        </div>
        <div className="rounded-2xl bg-indigo-50 border border-indigo-200 p-4 w-full text-left">
          <p className="text-sm text-indigo-700 font-medium mb-1">What to expect:</p>
          <p className="text-sm text-indigo-700">{s.baselineNote}</p>
        </div>
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 w-full text-left">
          <p className="text-sm text-amber-800">
            <strong>Coming soon:</strong> The baseline diary and full programme are being built.
            Your assessment is saved — come back soon!
          </p>
        </div>
      </div>
      <a href="/" className="text-sm text-gray-500 underline underline-offset-2 mt-8">Back to home</a>
    </main>
  );
}
