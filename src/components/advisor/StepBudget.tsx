"use client";

import { useState } from "react";
import type { AdvisorAnswers } from "@/types";
import { CARS } from "@/lib/cars/dataset";
import { useCity } from "@/hooks/useCity";

const PILLS = [
  { label: "Under ₹5L", min: 0, max: 500000, popular: false },
  { label: "₹5–10L", min: 500000, max: 1000000, popular: false },
  { label: "₹10–15L", min: 1000000, max: 1500000, popular: true },
  { label: "₹15–20L", min: 1500000, max: 2000000, popular: false },
  { label: "₹20–35L", min: 2000000, max: 3500000, popular: false },
  { label: "Above ₹35L", min: 3500000, max: 10000000, popular: false },
];

interface StepBudgetProps {
  answers: Partial<AdvisorAnswers>;
  onChange: (partial: Partial<AdvisorAnswers>) => void;
}

function countCarsInBudget(min: number, max: number): number {
  return CARS.filter((c) => c.exShowroomPrice >= min * 0.9 && c.exShowroomPrice <= max * 1.1).length;
}

export function StepBudget({ answers, onChange }: StepBudgetProps) {
  const { city } = useCity();
  const selectedMin = answers.budgetMin ?? 0;
  const selectedMax = answers.budgetMax ?? 0;

  const activePill = PILLS.find((p) => p.min === selectedMin && p.max === selectedMax);
  const count = selectedMin || selectedMax ? countCarsInBudget(selectedMin, selectedMax) : CARS.length;

  const select = (pill: typeof PILLS[0]) => {
    onChange({ budgetMin: pill.min, budgetMax: pill.max });
  };

  const cityLabel = city.charAt(0).toUpperCase() + city.slice(1);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-brand-navy mb-1">What&apos;s your budget?</h2>
        <p className="text-sm text-gray-500">Pick the range that feels right. On-road will be higher.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {PILLS.map((pill) => {
          const isActive = activePill?.label === pill.label;
          return (
            <button
              key={pill.label}
              onClick={() => select(pill)}
              className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all text-sm font-medium ${
                isActive
                  ? "border-brand-navy bg-brand-navy text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:border-brand-navy hover:text-brand-navy"
              }`}
            >
              {pill.popular && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-brand-red text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                  Most popular
                </span>
              )}
              {pill.label}
            </button>
          );
        })}
      </div>

      <div className="text-center space-y-1">
        <p className="text-sm font-semibold text-brand-navy">{count} cars available</p>
        {selectedMax > 0 && (
          <p className="text-xs text-gray-400">
            On-road in {cityLabel} adds ~₹1.2–2.5L above ex-showroom
          </p>
        )}
      </div>
    </div>
  );
}
