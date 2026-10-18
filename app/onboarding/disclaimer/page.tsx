import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { acknowledgeDisclaimer } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";
import { strings } from "@/strings/en";

export const instant = false;

const s = strings.disclaimer;

export default async function DisclaimerPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("disclaimer_acknowledged_at")
    .eq("id", user.id)
    .single();

  // Already acknowledged — skip forward.
  if (profile?.disclaimer_acknowledged_at) redirect("/onboarding/consent");

  return (
    <main className="flex flex-1 flex-col justify-between px-6 py-10">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center pt-6">
          <span className="text-5xl">🌙</span>
          <h1 className="text-2xl font-bold text-gray-900">{s.title}</h1>
        </div>

        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5">
          <p className="text-base text-amber-900 leading-relaxed">{s.body}</p>
        </div>
      </div>

      <form action={acknowledgeDisclaimer} className="mt-8">
        <Button type="submit" fullWidth>
          {s.cta}
        </Button>
      </form>
    </main>
  );
}
