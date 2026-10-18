"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { submitLightIsi } from "@/app/actions/lightTrack";
import { ISI_QUESTIONS, ISI_SCALES } from "@/lib/clinical/isi";
import type { IsiAnswers } from "@/lib/clinical/isi";
import { Button } from "@/components/ui/Button";

export function IsiCheckClient() {
  const router = useRouter();
  const params = useSearchParams();
  const week = (Number(params.get("week")) || 2) as 2 | 4;

  const [answers, setAnswers] = useState<(number | null)[]>([null, null, null, null, null, null, null]);
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);

  const allAnswered = answers.every((a) => a !== null);

  const handleSubmit = async () => {
    if (!allAnswered) { setShowError(true); return; }
    setLoading(true);
    const { outcome, needsEscalation } = await submitLightIsi(week, answers as IsiAnswers);
    if (needsEscalation) {
      router.push("/light-track/escalate");
    } else if (outcome === "remission") {
      router.push("/light-track/complete");
    } else {
      router.push("/light-track");
    }
  };

  return (
    <main className="flex flex-1 flex-col px-6 py-8 gap-6">
      <div className="text-center">
        <h1 className="text-xl font-bold text-gray-900">Week {week} Check-in</h1>
        <p className="mt-1 text-sm text-gray-500">These 7 questions help us track your progress.</p>
      </div>

      <div className="flex flex-col gap-5">
        {ISI_QUESTIONS.map((question, qi) => (
          <div key={qi} className="rounded-2xl border border-gray-200 bg-white p-4">
            <p className="text-sm font-medium text-gray-800 mb-3">
              {qi + 1}. {question}
            </p>
            <div className="flex flex-col gap-2">
              {ISI_SCALES[qi].map((label, vi) => (
                <button
                  key={vi}
                  type="button"
                  onClick={() => {
                    const a = [...answers]; a[qi] = vi; setAnswers(a); setShowError(false);
                  }}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-2 text-sm text-left transition-colors ${
                    answers[qi] === vi
                      ? "border-indigo-500 bg-indigo-50 text-indigo-800"
                      : "border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span className={`flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    answers[qi] === vi ? "border-indigo-500 bg-indigo-500" : "border-gray-300"
                  }`}>
                    {answers[qi] === vi && <span className="w-2 h-2 rounded-full bg-white" />}
                  </span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showError && <p className="text-sm text-red-500 text-center">Please answer all questions.</p>}

      <Button fullWidth onClick={handleSubmit} loading={loading}>
        Submit
      </Button>
    </main>
  );
}
