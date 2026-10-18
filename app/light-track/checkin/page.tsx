"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitLightCheckin } from "@/app/actions/lightTrack";
import { Button } from "@/components/ui/Button";

const QUALITY_OPTIONS = [
  { value: 1, emoji: "😫", label: "Very poor" },
  { value: 2, emoji: "😕", label: "Poor" },
  { value: 3, emoji: "😐", label: "Fair" },
  { value: 4, emoji: "😊", label: "Good" },
  { value: 5, emoji: "😄", label: "Very good" },
];

export default function LightCheckinPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selected) return;
    setLoading(true);
    await submitLightCheckin(selected);
    router.push("/light-track");
  };

  return (
    <main className="flex flex-1 flex-col px-6 py-10 gap-6">
      <div className="text-center pt-4">
        <span className="text-4xl">🦊</span>
        <h1 className="text-xl font-bold text-gray-900 mt-3">How did you sleep?</h1>
        <p className="text-sm text-gray-500 mt-1">Rate your sleep quality last night.</p>
      </div>

      <div className="flex flex-col gap-3">
        {QUALITY_OPTIONS.map(({ value, emoji, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setSelected(value)}
            className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition-colors ${
              selected === value
                ? "border-indigo-500 bg-indigo-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <span className="text-2xl">{emoji}</span>
            <span className="text-sm font-medium text-gray-800">{label}</span>
          </button>
        ))}
      </div>

      <Button fullWidth onClick={handleSubmit} loading={loading} disabled={!selected}>
        Save
      </Button>
    </main>
  );
}
