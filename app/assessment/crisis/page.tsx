import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { strings } from "@/strings/en";

export const instant = false;

const s = strings.crisis;

export default async function CrisisPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-12 gap-8">
      <div className="text-center flex flex-col gap-3">
        <h1 className="text-2xl font-bold text-gray-900">{s.title}</h1>
        <p className="text-gray-700 leading-relaxed">{s.body}</p>
        <p className="text-gray-500 text-sm leading-relaxed">{s.subBody}</p>
      </div>

      <div className="w-full flex flex-col gap-4">
        <a
          href="tel:1323"
          className="flex flex-col items-center gap-1 rounded-2xl bg-indigo-600 px-6 py-4 text-white text-center hover:bg-indigo-700 transition-colors"
        >
          <span className="text-lg font-bold">Call 1323</span>
          <span className="text-sm opacity-90">{s.hotline1323Label}</span>
          <span className="text-xs opacity-75">{s.hotline1323Hours}</span>
        </a>

        <a
          href="tel:1669"
          className="flex flex-col items-center gap-1 rounded-2xl bg-red-600 px-6 py-4 text-white text-center hover:bg-red-700 transition-colors"
        >
          <span className="text-lg font-bold">Call 1669</span>
          <span className="text-sm opacity-90">{s.hotline1669Label}</span>
        </a>
      </div>

      <a
        href="/"
        className="text-sm text-gray-500 underline underline-offset-2 hover:text-gray-700"
      >
        {s.backToHome}
      </a>
    </main>
  );
}
