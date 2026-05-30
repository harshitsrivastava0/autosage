"use client";

import type { AdvisorAnswers } from "@/types";
import { CARS } from "@/lib/cars/dataset";
import { filterAndScore } from "@/lib/cars/filter";

interface StepSummaryProps {
  answers: Partial<AdvisorAnswers>;
  city: string;
  onEdit: (step: number) => void;
  onSubmit: () => void;
}

function fmtBudget(n: number) {
  if (n >= 10000000) return "Above ₹35L";
  if (n === 0) return "No min";
  return `₹${(n / 100000).toFixed(0)}L`;
}

function countMatches(answers: Partial<AdvisorAnswers>): number {
  if (!answers.budgetMin && !answers.budgetMax) return CARS.length;
  try {
    const full: AdvisorAnswers = {
      budgetMin: answers.budgetMin ?? 0,
      budgetMax: answers.budgetMax ?? 10000000,
      useCase: answers.useCase ?? [],
      fuelPreference: answers.fuelPreference ?? ["any"],
      transmission: answers.transmission ?? "any",
      mustHaveFeatures: answers.mustHaveFeatures ?? [],
      seatsNeeded: answers.seatsNeeded ?? 5,
      prioritize: answers.prioritize ?? "features",
    };
    return filterAndScore(CARS, full).length;
  } catch {
    return 0;
  }
}

export function StepSummary({ answers, city, onEdit, onSubmit }: StepSummaryProps) {
  const matchCount = countMatches(answers);
  const cityLabel = city.charAt(0).toUpperCase() + city.slice(1);

  const rows = [
    { label: "City", value: cityLabel, step: 0 },
    {
      label: "Budget",
      value: answers.budgetMin !== undefined && answers.budgetMax !== undefined
        ? `${fmtBudget(answers.budgetMin)} – ${fmtBudget(answers.budgetMax)}`
        : "Not set",
      step: 1,
    },
    {
      label: "Use case",
      value: answers.useCase?.length ? answers.useCase.map((u) => u.replace(/_/g, " ")).join(", ") : "Any",
      step: 2,
    },
    {
      label: "Fuel",
      value: answers.fuelPreference?.includes("any") || !answers.fuelPreference?.length
        ? "Any"
        : answers.fuelPreference.join(", "),
      step: 3,
    },
    {
      label: "Seats",
      value: answers.seatsNeeded ? `${answers.seatsNeeded}+` : "5+",
      step: 3,
    },
    {
      label: "Priority",
      value: answers.prioritize ?? "Features",
      step: 3,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-brand-navy mb-1">Your preferences</h2>
        <p className="text-sm text-gray-500">
          <span className="font-semibold text-brand-navy">{matchCount} cars</span> match your criteria.
          AutoSage will pick the best 3 for you.
        </p>
      </div>

      <div className="bg-gray-50 rounded-xl divide-y divide-gray-100">
        {rows.map(({ label, value, step }) => (
          <div key={label} className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-gray-500 w-20 shrink-0">{label}</span>
            <span className="text-sm font-medium text-brand-navy flex-1 capitalize">{value}</span>
            <button
              onClick={() => onEdit(step)}
              className="text-xs text-brand-blue hover:underline shrink-0 ml-2"
            >
              Edit
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={onSubmit}
        className="w-full bg-brand-red hover:bg-brand-red/90 text-white font-semibold py-4 rounded-full text-lg transition-all hover:scale-[1.02] shadow-lg shadow-brand-red/20"
      >
        Find my shortlist →
      </button>
    </div>
  );
}
