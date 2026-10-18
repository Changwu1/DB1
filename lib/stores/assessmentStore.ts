"use client";

import { create } from "zustand";
import type { IsiAnswers } from "@/lib/clinical/isi";
import type { InsomniaType, DurationLabel } from "@/lib/types/database";
import type { Contraindication } from "@/lib/clinical/routing";

export type AssessmentStep =
  | "isi"
  | "type"
  | "duration"
  | "selfharm"
  | "stopbang"
  | "mood"
  | "contraindications"
  | "submitting";

interface AssessmentState {
  step: AssessmentStep;
  isiAnswers: (number | null)[];
  insomniaOnset: boolean;
  insomniaMaintenance: boolean;
  insomniaEarlyMorning: boolean;
  durationLabel: DurationLabel | null;
  selfharmAnswer: string | null;
  stopBangAnswers: boolean[]; // 8 items
  restlessLegs: boolean | null;
  circadian: boolean | null;
  phq2Answers: [number | null, number | null];
  gad2Answers: [number | null, number | null];
  contraindications: Contraindication[];

  setStep: (s: AssessmentStep) => void;
  setIsiAnswer: (idx: number, val: number) => void;
  setInsomniaType: (onset: boolean, maintenance: boolean, earlyMorning: boolean) => void;
  setDuration: (d: DurationLabel) => void;
  setSelfharm: (a: string) => void;
  setStopBangAnswer: (idx: number, val: boolean) => void;
  setRestlessLegs: (v: boolean) => void;
  setCircadian: (v: boolean) => void;
  setPhq2: (idx: 0 | 1, val: number) => void;
  setGad2: (idx: 0 | 1, val: number) => void;
  toggleContraindication: (c: Contraindication) => void;
}

export const useAssessmentStore = create<AssessmentState>((set) => ({
  step: "isi",
  isiAnswers: [null, null, null, null, null, null, null],
  insomniaOnset: false,
  insomniaMaintenance: false,
  insomniaEarlyMorning: false,
  durationLabel: null,
  selfharmAnswer: null,
  stopBangAnswers: [false, false, false, false, false, false, false, false],
  restlessLegs: null,
  circadian: null,
  phq2Answers: [null, null],
  gad2Answers: [null, null],
  contraindications: [],

  setStep: (step) => set({ step }),
  setIsiAnswer: (idx, val) =>
    set((s) => {
      const answers = [...s.isiAnswers];
      answers[idx] = val;
      return { isiAnswers: answers };
    }),
  setInsomniaType: (onset, maintenance, earlyMorning) =>
    set({ insomniaOnset: onset, insomniaMaintenance: maintenance, insomniaEarlyMorning: earlyMorning }),
  setDuration: (d) => set({ durationLabel: d }),
  setSelfharm: (a) => set({ selfharmAnswer: a }),
  setStopBangAnswer: (idx, val) =>
    set((s) => {
      const arr = [...s.stopBangAnswers];
      arr[idx] = val;
      return { stopBangAnswers: arr };
    }),
  setRestlessLegs: (v) => set({ restlessLegs: v }),
  setCircadian: (v) => set({ circadian: v }),
  setPhq2: (idx, val) =>
    set((s) => {
      const a: [number | null, number | null] = [...s.phq2Answers];
      a[idx] = val;
      return { phq2Answers: a };
    }),
  setGad2: (idx, val) =>
    set((s) => {
      const a: [number | null, number | null] = [...s.gad2Answers];
      a[idx] = val;
      return { gad2Answers: a };
    }),
  toggleContraindication: (c) =>
    set((s) => ({
      contraindications: s.contraindications.includes(c)
        ? s.contraindications.filter((x) => x !== c)
        : [...s.contraindications, c],
    })),
}));
