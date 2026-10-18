"use client";

import { useState } from "react";
import { attestClearance } from "@/app/actions/assessment";
import { Button } from "@/components/ui/Button";
import { strings } from "@/strings/en";

const s = strings.assessment.routing.doctorFirst;

export default function ClearancePage() {
  const [attested, setAttested] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = async () => {
    if (!attested) { setError(true); return; }
    setLoading(true);
    await attestClearance();
    setLoading(false);
  };

  return (
    <main className="flex flex-1 flex-col px-6 py-10 gap-6">
      <div className="text-center flex flex-col gap-3 pt-4">
        <span className="text-4xl">🩺</span>
        <h1 className="text-2xl font-bold text-gray-900">{s.title}</h1>
        <p className="text-gray-600 leading-relaxed">{s.body}</p>
      </div>

      <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4">
        <p className="text-sm text-amber-800">{s.weekTwoReminder}</p>
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={attested}
          onChange={(e) => { setAttested(e.target.checked); setError(false); }}
          className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600"
        />
        <span className="text-sm text-gray-700">{s.attestationLabel}</span>
      </label>

      {error && (
        <p className="text-sm text-red-500">{s.attestationRequired}</p>
      )}

      <Button fullWidth onClick={handleSubmit} loading={loading}>
        {s.alreadySawDoctorCta}
      </Button>
    </main>
  );
}
