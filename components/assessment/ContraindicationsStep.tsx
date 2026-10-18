"use client";

import { useState } from "react";
import { useAssessmentStore } from "@/lib/stores/assessmentStore";
import { Button } from "@/components/ui/Button";
import { strings } from "@/strings/en";
import type { Contraindication } from "@/lib/clinical/routing";

const s = strings.assessment.contraindications;

const QUESTIONS: { label: string; contraindication: Contraindication | null }[] = [
  { label: "Have you ever been diagnosed with bipolar disorder or a seizure disorder / epilepsy?", contraindication: "bipolar_or_seizure" },
  { label: "Are you currently pregnant?", contraindication: "pregnancy_or_high_risk_occupation" },
  { label: "Does your work involve professional driving, operating heavy machinery, or other safety-critical tasks where drowsiness could be dangerous?", contraindication: "pregnancy_or_high_risk_occupation" },
];

interface Props {
  onNext: () => Promise<void>;
  onBack: () => void;
}

export function ContraindicationsStep({ onNext, onBack }: Props) {
  const store = useAssessmentStore();
  const [answers, setAnswers] = useState<(boolean | null)[]>([null, null, null]);
  const [loading, setLoading] = useState(false);

  const allAnswered = answers.every((a) => a !== null);

  const setAnswer = (idx: number, val: boolean) => {
    const next = [...answers];
    next[idx] = val;
    setAnswers(next);

    // Sync contraindications store
    const ci = QUESTIONS[idx].contraindication;
    if (!ci) return;

    // Recalculate from all answers
    const newContraindications: Contraindication[] = [];
    const nextArr = [...answers];
    nextArr[idx] = val;
    nextArr.forEach((a, i) => {
      const c = QUESTIONS[i].contraindication;
      if (a === true && c && !newContraindications.includes(c)) {
        newContraindications.push(c);
      }
    });

    // Replace the store's contraindications
    store.contraindications.forEach((c) => {
      if (!newContraindications.includes(c)) store.toggleContraindication(c);
    });
    newContraindications.forEach((c) => {
      if (!store.contraindications.includes(c)) store.toggleContraindication(c);
    });
  };

  const hasBipolarOrSeizure = answers[0] === true;
  const hasHighRisk = answers[1] === true || answers[2] === true;

  const handleNext = async () => {
    setLoading(true);
    await onNext();
    setLoading(false);
  };

  return (
    <div className="flex flex-1 flex-col px-6 py-8 gap-6">
      <div className="text-center">
        <h1 className="text-xl font-bold text-gray-900">{s.title}</h1>
        <p className="mt-2 text-sm text-gray-500">{s.intro}</p>
      </div>

      <div className="flex flex-col gap-4">
        {QUESTIONS.map((q, i) => (
          <div key={i} className="rounded-2xl border border-gray-200 bg-white p-4">
            <p className="text-sm text-gray-800 mb-3">{q.label}</p>
            <div className="flex gap-3">
              {[true, false].map((val) => (
                <button
                  key={String(val)}
                  type="button"
                  onClick={() => setAnswer(i, val)}
                  className={`flex-1 rounded-xl border py-2 text-sm font-medium transition-colors ${
                    answers[i] === val
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {val ? "Yes" : "No"}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {hasBipolarOrSeizure && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4">
          <p className="text-sm text-amber-800">
            We recommend speaking to your doctor before starting a sleep programme. You can still continue — we'll tailor the programme for you.
          </p>
        </div>
      )}

      {hasHighRisk && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4">
          <p className="text-sm text-amber-800">
            Some sleep restriction techniques can increase daytime fatigue. We'll use a gentler approach for you.
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="ghost" onClick={onBack}>Back</Button>
        <Button fullWidth onClick={handleNext} loading={loading} disabled={!allAnswered}>
          See my results
        </Button>
      </div>
    </div>
  );
}
