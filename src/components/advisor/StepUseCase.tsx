"use client";

import type { AdvisorAnswers, UseCase } from "@/types";

const USE_CASES: { id: UseCase; icon: string; title: string; subtitle: string }[] = [
  { id: "city_commute", icon: "🏙️", title: "City commute", subtitle: "Daily office/errands, mostly city roads" },
  { id: "family_weekends", icon: "👨‍👩‍👧‍👦", title: "Family weekends", subtitle: "Outings, school runs, comfort seating" },
  { id: "highway", icon: "🛣️", title: "Highway trips", subtitle: "Long drives, fuel efficiency matters" },
  { id: "offroad", icon: "⛰️", title: "Off-road / adventure", subtitle: "Rough terrain, high ground clearance" },
  { id: "mixed", icon: "🔄", title: "Mixed use", subtitle: "Little of everything" },
];

interface StepUseCaseProps {
  answers: Partial<AdvisorAnswers>;
  onChange: (partial: Partial<AdvisorAnswers>) => void;
}

export function StepUseCase({ answers, onChange }: StepUseCaseProps) {
  const selected = answers.useCase ?? [];

  const toggle = (id: UseCase) => {
    const next = selected.includes(id)
      ? selected.filter((u) => u !== id)
      : [...selected, id];
    onChange({ useCase: next });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-brand-navy mb-1">How will you mostly use it?</h2>
        <p className="text-sm text-gray-500">Select all that apply.</p>
      </div>

      <div className="space-y-3">
        {USE_CASES.map(({ id, icon, title, subtitle }) => {
          const isActive = selected.includes(id);
          return (
            <button
              key={id}
              onClick={() => toggle(id)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                isActive
                  ? "border-brand-navy bg-brand-navy/5"
                  : "border-gray-200 bg-white hover:border-brand-navy/50"
              }`}
            >
              <span className="text-2xl shrink-0">{icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-brand-navy text-sm">{title}</p>
                <p className="text-xs text-gray-500">{subtitle}</p>
              </div>
              {isActive && (
                <span className="shrink-0 w-5 h-5 rounded-full bg-brand-navy flex items-center justify-center text-white text-xs">✓</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
