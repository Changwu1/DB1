"use client";

import { useState } from "react";
import { useAssessmentStore } from "@/lib/stores/assessmentStore";
import { Button } from "@/components/ui/Button";
import { strings } from "@/strings/en";
import type { DurationLabel } from "@/lib/types/database";

const s = strings.assessment;

interface Props {
  onNext: (d: DurationLabel) => Promise<void>;
  onBack: () => void;
}

const DURATION_OPTIONS: { value: DurationLabel; label: string; hint: string }[] = [
  { value: "acute", label: "Less than 3 months", hint: "Acute" },
  { value: "chronic", label: "3 months or longer", hint: "Chronic" },
];

export function DurationStep({ onNext, onBack }: Props) {
  const { durationLabel, setDuration } = useAssessmentStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleNext = async () => {
    if (!durationLabel) { setError(true); return; }
    setLoading(true);
    await onNext(durationLabel);
    setLoading(false);
  };

  return (
    <div className="flex flex-1 flex-col px-6 py-8 gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">{s.duration.title}</h1>
        <p className="mt-2 text-sm text-gray-500">How long have you had trouble sleeping?</p>
      </div>

      <div className="flex flex-col gap-3">
        {DURATION_OPTIONS.map(({ value, label, hint }) => (
          <button
            key={value}
            type="button"
            onClick={() => { setDuration(value); setError(false); }}
            className={`rounded-2xl border p-4 text-left transition-colors ${
              durationLabel === value
                ? "border-indigo-500 bg-indigo-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <p className="text-sm font-medium text-gray-800">{label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{hint}</p>
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-500 text-center">Please select an option.</p>}

      <div className="flex gap-3">
        <Button variant="ghost" onClick={onBack}>{s.backCta}</Button>
        <Button fullWidth onClick={handleNext} loading={loading}>{s.nextCta}</Button>
      </div>
    </div>
  );
}
