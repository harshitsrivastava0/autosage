"use client";

import { useState } from "react";
import type { AdvisorAnswers } from "@/types";
import { useCity } from "@/hooks/useCity";
import { CitySelector } from "@/components/ui/CitySelector";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StepBudget } from "./StepBudget";
import { StepUseCase } from "./StepUseCase";
import { StepPreferences } from "./StepPreferences";
import { StepSummary } from "./StepSummary";

interface QuestionnaireWizardProps {
  answers: Partial<AdvisorAnswers>;
  onAnswersChange: (partial: Partial<AdvisorAnswers>) => void;
  onSubmit: () => void;
}

const STEPS = ["City", "Budget", "Use case", "Preferences", "Summary"];
const TOTAL = STEPS.length;

export function QuestionnaireWizard({ answers, onAnswersChange, onSubmit }: QuestionnaireWizardProps) {
  const { city } = useCity();
  const [stepIdx, setStepIdx] = useState(0); // 0 = city, 1 = budget, 2 = usecase, 3 = prefs, 4 = summary

  const goTo = (idx: number) => setStepIdx(Math.max(0, Math.min(TOTAL - 1, idx)));
  const canNext = () => {
    if (stepIdx === 0) return !!city;
    if (stepIdx === 1) return !!(answers.budgetMin !== undefined && answers.budgetMax !== undefined && answers.budgetMax > 0);
    return true;
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      {/* Progress */}
      <div className="mb-8 space-y-3">
        <div className="flex items-center justify-between">
          {STEPS.map((label, i) => (
            <button
              key={label}
              onClick={() => i < stepIdx && goTo(i)}
              disabled={i >= stepIdx}
              className={`text-xs font-medium transition-colors ${
                i === stepIdx
                  ? "text-brand-navy"
                  : i < stepIdx
                  ? "text-brand-blue cursor-pointer hover:underline"
                  : "text-gray-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <ProgressBar value={(stepIdx / (TOTAL - 1)) * 100} animated={false} className="h-1.5" />
        <p className="text-xs text-gray-400 text-right">Step {stepIdx + 1} of {TOTAL}</p>
      </div>

      {/* Step content */}
      <div className="min-h-[360px]">
        {stepIdx === 0 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-brand-navy mb-1">Which city are you buying in?</h2>
              <p className="text-sm text-gray-500">On-road prices vary significantly by city.</p>
            </div>
            <CitySelector variant="buttons" />
          </div>
        )}
        {stepIdx === 1 && <StepBudget answers={answers} onChange={onAnswersChange} />}
        {stepIdx === 2 && <StepUseCase answers={answers} onChange={onAnswersChange} />}
        {stepIdx === 3 && <StepPreferences answers={answers} onChange={onAnswersChange} />}
        {stepIdx === 4 && (
          <StepSummary
            answers={answers}
            city={city}
            onEdit={(s) => goTo(s)}
            onSubmit={onSubmit}
          />
        )}
      </div>

      {/* Navigation — hidden on summary (has its own CTA) */}
      {stepIdx < 4 && (
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={() => goTo(stepIdx - 1)}
            disabled={stepIdx === 0}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-navy disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            ← Back
          </button>

          <div className="flex items-center gap-3">
            {/* Skip available on preferences step */}
            {stepIdx === 3 && (
              <button
                onClick={() => goTo(4)}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                Skip
              </button>
            )}
            <button
              onClick={() => goTo(stepIdx + 1)}
              disabled={!canNext()}
              className="flex items-center gap-1.5 bg-brand-navy text-white font-medium px-6 py-2.5 rounded-full text-sm hover:bg-brand-navy/90 disabled:opacity-40 disabled:pointer-events-none transition-all"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
