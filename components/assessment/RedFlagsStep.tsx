"use client";

import { useState } from "react";
import { useAssessmentStore } from "@/lib/stores/assessmentStore";
import { Button } from "@/components/ui/Button";
import { strings } from "@/strings/en";

const s = strings.assessment.redflags;

const STOP_BANG_QUESTIONS = [
  "Do you snore loudly (louder than talking or loud enough to be heard through closed doors)?",
  "Do you often feel tired, fatigued, or sleepy during the day?",
  "Has anyone observed you stop breathing during your sleep?",
  "Do you have or are you being treated for high blood pressure?",
  "Is your BMI more than 35?",
  "Are you older than 50?",
  "Is your neck size large? (collar size larger than 40 cm / 16 in for women, 43 cm / 17 in for men)",
  "Are you male?",
] as const;

const PHQ2_QUESTIONS = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
] as const;

const GAD2_QUESTIONS = [
  "Feeling nervous, anxious, or on edge",
  "Not being able to stop or control worrying",
] as const;

const FREQ_OPTIONS = [
  { value: 0, label: "Not at all" },
  { value: 1, label: "Several days" },
  { value: 2, label: "More than half the days" },
  { value: 3, label: "Nearly every day" },
];

interface Props {
  onNext: () => void;
}

export function RedFlagsStep({ onNext }: Props) {
  const store = useAssessmentStore();
  const [subStep, setSubStep] = useState<"stopbang" | "mood">("stopbang");

  const stopBangScore = store.stopBangAnswers.filter(Boolean).length;
  const isHighRiskApnea = stopBangScore >= 3;

  const phq2Total = (store.phq2Answers[0] ?? 0) + (store.phq2Answers[1] ?? 0);
  const gad2Total = (store.gad2Answers[0] ?? 0) + (store.gad2Answers[1] ?? 0);
  const moodFlag = phq2Total >= 3 || gad2Total >= 3;

  const allMoodAnswered =
    store.phq2Answers[0] !== null &&
    store.phq2Answers[1] !== null &&
    store.gad2Answers[0] !== null &&
    store.gad2Answers[1] !== null;

  if (subStep === "stopbang") {
    const allAnswered = store.restlessLegs !== null && store.circadian !== null;

    return (
      <div className="flex flex-1 flex-col px-6 py-8 gap-6">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900">{s.stopbang.title}</h1>
          <p className="mt-1 text-sm text-gray-500">Answer yes or no to each question.</p>
        </div>

        <div className="flex flex-col gap-3">
          {STOP_BANG_QUESTIONS.map((q, i) => (
            <div key={i} className="rounded-2xl border border-gray-200 bg-white p-4">
              <p className="text-sm text-gray-800 mb-3">{q}</p>
              <div className="flex gap-3">
                {[true, false].map((val) => (
                  <button
                    key={String(val)}
                    type="button"
                    onClick={() => store.setStopBangAnswer(i, val)}
                    className={`flex-1 rounded-xl border py-2 text-sm font-medium transition-colors ${
                      store.stopBangAnswers[i] === val
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

          {/* Restless legs */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <p className="text-sm text-gray-800 mb-3">
              Do you have an uncomfortable urge to move your legs, especially at night or when resting?
            </p>
            <div className="flex gap-3">
              {[true, false].map((val) => (
                <button
                  key={String(val)}
                  type="button"
                  onClick={() => store.setRestlessLegs(val)}
                  className={`flex-1 rounded-xl border py-2 text-sm font-medium transition-colors ${
                    store.restlessLegs === val
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {val ? "Yes" : "No"}
                </button>
              ))}
            </div>
          </div>

          {/* Circadian */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <p className="text-sm text-gray-800 mb-3">
              Do you work night shifts, rotating shifts, or regularly sleep at unusual hours (e.g., sleeping at 4 am, waking at noon)?
            </p>
            <div className="flex gap-3">
              {[true, false].map((val) => (
                <button
                  key={String(val)}
                  type="button"
                  onClick={() => store.setCircadian(val)}
                  className={`flex-1 rounded-xl border py-2 text-sm font-medium transition-colors ${
                    store.circadian === val
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {val ? "Yes" : "No"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Button
          fullWidth
          onClick={() => setSubStep("mood")}
          disabled={!allAnswered}
        >
          Next
        </Button>
      </div>
    );
  }

  // Mood step (PHQ-2 + GAD-2)
  return (
    <div className="flex flex-1 flex-col px-6 py-8 gap-6">
      <div className="text-center">
        <h1 className="text-xl font-bold text-gray-900">A few more questions</h1>
        <p className="mt-1 text-sm text-gray-500">Over the last 2 weeks, how often have you been bothered by the following?</p>
      </div>

      <div className="flex flex-col gap-4">
        {[...PHQ2_QUESTIONS].map((q, i) => (
          <div key={i} className="rounded-2xl border border-gray-200 bg-white p-4">
            <p className="text-sm font-medium text-gray-800 mb-3">{q}</p>
            <div className="flex flex-col gap-2">
              {FREQ_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => store.setPhq2(i as 0 | 1, value)}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-2 text-sm text-left transition-colors ${
                    store.phq2Answers[i] === value
                      ? "border-indigo-500 bg-indigo-50 text-indigo-800"
                      : "border-gray-100 bg-gray-50 text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span className={`flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    store.phq2Answers[i] === value ? "border-indigo-500 bg-indigo-500" : "border-gray-300"
                  }`}>
                    {store.phq2Answers[i] === value && <span className="w-2 h-2 rounded-full bg-white" />}
                  </span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}

        {[...GAD2_QUESTIONS].map((q, i) => (
          <div key={i} className="rounded-2xl border border-gray-200 bg-white p-4">
            <p className="text-sm font-medium text-gray-800 mb-3">{q}</p>
            <div className="flex flex-col gap-2">
              {FREQ_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => store.setGad2(i as 0 | 1, value)}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-2 text-sm text-left transition-colors ${
                    store.gad2Answers[i] === value
                      ? "border-indigo-500 bg-indigo-50 text-indigo-800"
                      : "border-gray-100 bg-gray-50 text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span className={`flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    store.gad2Answers[i] === value ? "border-indigo-500 bg-indigo-500" : "border-gray-300"
                  }`}>
                    {store.gad2Answers[i] === value && <span className="w-2 h-2 rounded-full bg-white" />}
                  </span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {moodFlag && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4">
          <p className="text-sm text-amber-800">{s.mood.softFlagMessage}</p>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="ghost" onClick={() => setSubStep("stopbang")}>Back</Button>
        <Button fullWidth onClick={onNext} disabled={!allMoodAnswered}>
          Next
        </Button>
      </div>
    </div>
  );
}
