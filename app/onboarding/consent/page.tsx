"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { giveConsent } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";
import { strings } from "@/strings/en";

const s = strings.consent;

export default function ConsentPage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [checkedError, setCheckedError] = useState(false);
  const [pending, setPending] = useState(false);

  // Skip forward if already consented.
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.replace("/auth/login"); return; }
      supabase
        .from("profiles")
        .select("consent_at")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data?.consent_at) router.replace("/assessment");
        });
    });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!checked) { setCheckedError(true); return; }
    setCheckedError(false);
    setPending(true);
    await giveConsent();
  }

  return (
    <main className="flex flex-1 flex-col justify-between px-6 py-10">
      <div className="flex flex-col gap-6 pt-6">
        <h1 className="text-2xl font-bold text-gray-900">Before we start</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => {
                setChecked(e.target.checked);
                setCheckedError(false);
              }}
              className="mt-1 h-5 w-5 flex-shrink-0 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-base text-gray-700 leading-relaxed">
              {s.checkboxLabel}
            </span>
          </label>

          {checkedError && (
            <p className="text-sm text-red-600" role="alert">
              {s.required}
            </p>
          )}

          <Button type="submit" fullWidth loading={pending}>
            Continue
          </Button>
        </form>
      </div>
    </main>
  );
}
