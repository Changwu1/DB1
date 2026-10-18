"use client";

import { useRouter } from "next/navigation";
import { useAssessmentStore } from "@/lib/stores/assessmentStore";
import { IsiStep } from "./IsiStep";
import { TypeStep } from "./TypeStep";
import { DurationStep } from "./DurationStep";
import { SelfharmStep } from "./SelfharmStep";
import { RedFlagsStep } from "./RedFlagsStep";
import { ContraindicationsStep } from "./ContraindicationsStep";
import {
  saveAssessmentStep1,
  submitSelfharm,
  finalizeAssessment,
} from "@/app/actions/assessment";
import type { IsiAnswers } from "@/lib/clinical/isi";
import type { InsomniaType, DurationLabel } from "@/lib/types/database";

export function AssessmentWizard() {
  const router = useRouter();
  const store = useAssessmentStore();

  const resolveInsomniaType = (): InsomniaType => {
    const { insomniaOnset, insomniaMaintenance, insomniaEarlyMorning } = store;
    const count = [insomniaOnset, insomniaMaintenance, insomniaEarlyMorning].filter(Boolean).length;
    if (count >= 2) return "mixed";
    if (insomniaOnset) return "onset";
    if (insomniaMaintenance) return "maintenance";
    return "early_morning";
  };

  const handleIsiNext = () => store.setStep("type");

  const handleTypeNext = () => store.setStep("duration");

  const handleDurationNext = async (d: DurationLabel) => {
    store.setDuration(d);
    const type = resolveInsomniaType();
    await saveAssessmentStep1({
      isiAnswers: store.isiAnswers as IsiAnswers,
      insomniaType: type,
      durationLabel: d,
    });
    store.setStep("selfharm");
  };

  const handleSelfharm = async (answer: string) => {
    store.setSelfharm(answer);
    const { crisis } = await submitSelfharm(answer);
    if (crisis) {
      router.push("/assessment/crisis");
    } else {
      store.setStep("stopbang");
    }
  };

  const handleRedFlagsNext = () => store.setStep("contraindications");

  const handleContraindicationsNext = async () => {
    store.setStep("submitting");
    const stopBangScore = store.stopBangAnswers.filter(Boolean).length;
    const { routing } = await finalizeAssessment({
      stopBangScore,
      restlessLegs: store.restlessLegs ?? false,
      circadian: store.circadian ?? false,
      phq2Score: (store.phq2Answers[0] ?? 0) + (store.phq2Answers[1] ?? 0),
      gad2Score: (store.gad2Answers[0] ?? 0) + (store.gad2Answers[1] ?? 0),
      contraindications: store.contraindications,
    });

    if (routing === "referral_gated") {
      router.push("/assessment/clearance");
    } else {
      router.push("/assessment/result");
    }
  };

  if (store.step === "submitting") {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-gray-500">Working out your results…</p>
      </div>
    );
  }

  if (store.step === "isi") return <IsiStep onNext={handleIsiNext} />;
  if (store.step === "type") return <TypeStep onNext={handleTypeNext} onBack={() => store.setStep("isi")} />;
  if (store.step === "duration") return <DurationStep onNext={handleDurationNext} onBack={() => store.setStep("type")} />;
  if (store.step === "selfharm") return <SelfharmStep onSubmit={handleSelfharm} />;
  if (store.step === "stopbang" || store.step === "mood")
    return <RedFlagsStep onNext={handleRedFlagsNext} />;
  if (store.step === "contraindications")
    return <ContraindicationsStep onNext={handleContraindicationsNext} onBack={() => store.setStep("stopbang")} />;

  return null;
}
