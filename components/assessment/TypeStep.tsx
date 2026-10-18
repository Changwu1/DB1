"use client";

import { useState } from "react";
import { useAssessmentStore } from "@/lib/stores/assessmentStore";
import { Button } from "@/components/ui/Button";
import { strings } from "@/strings/en";

const s = strings.assessment;

interface Props {
  onNext: () => void;
  onBack: () => void;
}

const TYPE_OPTIONS = [
  { key: "onset" as const, label: "Takes me a long time to fall asleep (> 30 min)" },
  { key: "maintenance" as const, label: "I wake up during the night and struggle to get back to sleep (> 30 min awake)" },
  { key: "early_morning" as const, label: "I wake up too early and can't get back to sleep (≥ 30 min before I need to)" },
] as const;

export function TypeStep({ onNext, onBack }: Props) {
  const { insomniaOnset, insomniaMaintenance, insomniaEarlyMorning, setInsomniaType } = useAssessmentStore();
  const [error, setError] = useState(false);

  const selected = { onset: insomniaOnset, maintenance: insomniaMaintenance, early_morning: insomniaEarlyMorning };

  const toggle = (key: "onset" | "maintenance" | "early_morning") => {
    setError(false);
    const next = { ...selected, [key]: !selected[key] };
    setInsomniaType(next.onset, next.maintenance, next.early_morning);
  };

  const anySelected = insomniaOnset || insomniaMaintenance || insomniaEarlyMorning;

  const handleNext = () => {
    if (!anySelected) { setError(true); return; }
    onNext();
  };

  return (
    <div className="flex flex-1 flex-col px-6 py-8 gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">{s.type.title}</h1>
        <p className="mt-2 text-sm text-gray-500">Select all that apply.</p>
      </div>

      <div className="flex flex-col gap-3">
        {TYPE_OPTIONS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => toggle(key)}
            className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition-colors ${
              selected[key]
                ? "border-indigo-500 bg-indigo-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <span className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center ${
              selected[key] ? "border-indigo-500 bg-indigo-500" : "border-gray-300"
            }`}>
              {selected[key] && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            <span className="text-sm text-gray-800">{label}</span>
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-500 text-center">Please select at least one option.</p>}

      <div className="flex gap-3">
        <Button variant="ghost" onClick={onBack}>{s.backCta}</Button>
        <Button fullWidth onClick={handleNext}>{s.nextCta}</Button>
      </div>
    </div>
  );
}
