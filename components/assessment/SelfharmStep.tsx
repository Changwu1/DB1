"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { strings } from "@/strings/en";

const s = strings.assessment.selfharm;

const OPTIONS = [
  { value: "not_at_all", label: s.options.not_at_all },
  { value: "several_days", label: s.options.several_days },
  { value: "more_than_half", label: s.options.more_than_half },
  { value: "nearly_every_day", label: s.options.nearly_every_day },
];

interface Props {
  onSubmit: (answer: string) => Promise<void>;
}

export function SelfharmStep({ onSubmit }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = async () => {
    if (!selected) { setError(true); return; }
    setLoading(true);
    await onSubmit(selected);
    setLoading(false);
  };

  return (
    <div className="flex flex-1 flex-col px-6 py-8 gap-6">
      <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4">
        <p className="text-sm font-medium text-amber-900 leading-relaxed">{s.questionText}</p>
      </div>

      <div className="flex flex-col gap-3">
        {OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => { setSelected(value); setError(false); }}
            className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-colors ${
              selected === value
                ? "border-indigo-500 bg-indigo-50 text-indigo-800"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
            }`}
          >
            <span className={`flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
              selected === value ? "border-indigo-500 bg-indigo-500" : "border-gray-300"
            }`}>
              {selected === value && <span className="w-2 h-2 rounded-full bg-white" />}
            </span>
            <span className="text-sm">{label}</span>
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-500 text-center">Please select an answer.</p>}

      <Button fullWidth onClick={handleSubmit} loading={loading}>
        Continue
      </Button>
    </div>
  );
}
