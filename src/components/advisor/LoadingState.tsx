"use client";

import { useState, useEffect } from "react";
import type { AdvisorAnswers } from "@/types";
import { LoadingOrb } from "@/components/ui/LoadingOrb";
import { ProgressBar } from "@/components/ui/ProgressBar";

interface LoadingStateProps {
  answers: Partial<AdvisorAnswers>;
  city: string;
}

function buildMessages(answers: Partial<AdvisorAnswers>, city: string): string[] {
  const cityLabel = city.charAt(0).toUpperCase() + city.slice(1);
  const fuel = answers.fuelPreference?.includes("any") || !answers.fuelPreference?.length
    ? "all fuel types"
    : answers.fuelPreference.join(" & ");
  const useCase = answers.useCase?.[0]?.replace(/_/g, " ") ?? "your use case";

  return [
    `Filtering 50 cars for ${cityLabel} on-road prices…`,
    `Scoring ${fuel} options against your budget…`,
    `Analysing 47,000 owner reviews for ${useCase}…`,
    "Running AI ranking with Claude…",
    "Calculating real monthly ownership costs…",
    "Preparing your personalised shortlist…",
  ];
}

export function LoadingState({ answers, city }: LoadingStateProps) {
  const messages = buildMessages(answers, city);
  const [msgIdx, setMsgIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMsgIdx((i) => Math.min(i + 1, messages.length - 1));
    }, 2000);

    // Fills ~0–92% over 8s; final jump happens when results arrive
    const progInterval = setInterval(() => {
      setProgress((p) => Math.min(p + 1.5, 92));
    }, 130);

    return () => {
      clearInterval(msgInterval);
      clearInterval(progInterval);
    };
  }, [messages.length]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 px-4 text-center">
      <LoadingOrb className="w-20 h-20" />

      <div className="space-y-2 max-w-sm">
        <p className="text-brand-navy font-semibold text-lg">Finding your perfect cars…</p>
        <p className="text-gray-500 text-sm h-5 transition-all">{messages[msgIdx]}</p>
      </div>

      <div className="w-full max-w-xs space-y-2">
        <ProgressBar value={progress} animated={false} className="h-2" />
        <p className="text-xs text-gray-400">{Math.round(progress)}% complete</p>
      </div>
    </div>
  );
}
