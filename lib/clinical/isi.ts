import type { InsomniaSeverity } from "@/lib/types/database";

export type IsiAnswers = [number, number, number, number, number, number, number];

export function scoreIsi(answers: IsiAnswers): number {
  return answers.reduce((sum, v) => sum + v, 0);
}

export function isiSeverity(score: number): InsomniaSeverity {
  if (score <= 7) return "none";
  if (score <= 14) return "subthreshold";
  if (score <= 21) return "moderate";
  return "severe";
}

export const ISI_QUESTIONS = [
  "Difficulty falling asleep",
  "Difficulty staying asleep",
  "Problems waking up too early",
  "How satisfied or dissatisfied are you with your current sleep pattern?",
  "How noticeable to others do you think your sleep problem is in terms of impairing the quality of your life?",
  "How worried or distressed are you about your current sleep problem?",
  "To what extent do you consider your sleep problem to interfere with your daily functioning?",
] as const;

export const ISI_SCALES: [string, string, string, string, string][] = [
  ["None", "Mild", "Moderate", "Severe", "Very Severe"],
  ["None", "Mild", "Moderate", "Severe", "Very Severe"],
  ["None", "Mild", "Moderate", "Severe", "Very Severe"],
  ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
  ["Not at All", "A Little", "Somewhat", "Much", "Very Much"],
  ["Not at All", "A Little", "Somewhat", "Much", "Very Much"],
  ["Not at All", "A Little", "Somewhat", "Much", "Very Much"],
];
