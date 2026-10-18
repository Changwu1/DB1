"use client";

import { useState } from "react";
import { useAssessmentStore } from "@/lib/stores/assessmentStore";
import { ISI_QUESTIONS, ISI_SCALES } from "@/lib/clinical/isi";
import { Button } from "@/components/ui/Button";
import { strings } from "@/strings/en";

const s = strings.assessment;

interface Props {
  onNext: () => void;
}

export function IsiStep({ onNext }: Props) {
  const { isiAnswers, setIsiAnswer } = useAssessmentStore();
  const [error, setError] = useState(false);

  const allAnswered = isiAnswers.every((a) => a !== null);

  const handleNext = () => {
    if (!allAnswered) {
      setError(true);
      return;
    }
    onNext();
  };

  return (
    <div className="flex flex-1 flex-col px-6 py-8 gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">{s.isi.title}</h1>
        <p className="mt-2 text-sm text-gray-500">{s.isi.intro}</p>
      </div>

      <div className="flex flex-col gap-6">
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
                  onClick={() => { setIsiAnswer(qi, vi); setError(false); }}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-2 text-sm text-left transition-colors ${
                    isiAnswers[qi] === vi
                      ? "border-indigo-500 bg-indigo-50 text-indigo-800"
                      : "border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span className={`flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    isiAnswers[qi] === vi ? "border-indigo-500 bg-indigo-500" : "border-gray-300"
                  }`}>
                    {isiAnswers[qi] === vi && (
                      <span className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-500 text-center">Please answer all questions.</p>
      )}

      <Button fullWidth onClick={handleNext}>
        {s.nextCta}
      </Button>
    </div>
  );
}
