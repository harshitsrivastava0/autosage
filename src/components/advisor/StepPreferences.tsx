"use client";

import type { AdvisorAnswers, FuelType, PriorityType, TransmissionType } from "@/types";

const FUELS: { id: FuelType | "any"; label: string }[] = [
  { id: "petrol", label: "⛽ Petrol" },
  { id: "diesel", label: "🛢 Diesel" },
  { id: "hybrid", label: "♻ Hybrid" },
  { id: "electric", label: "⚡ Electric" },
  { id: "cng", label: "🌿 CNG" },
  { id: "any", label: "Any" },
];

const TRANSMISSIONS: { id: TransmissionType | "any"; label: string }[] = [
  { id: "manual", label: "Manual" },
  { id: "automatic", label: "Automatic" },
  { id: "amt", label: "AMT" },
  { id: "cvt", label: "CVT" },
  { id: "any", label: "Any" },
];

const SEATS = [4, 5, 6, 7];

const PRIORITIES: { id: PriorityType; icon: string; label: string }[] = [
  { id: "safety", icon: "🛡", label: "Safety" },
  { id: "performance", icon: "🚀", label: "Performance" },
  { id: "mileage", icon: "⛽", label: "Mileage" },
  { id: "features", icon: "✨", label: "Features" },
  { id: "resale", icon: "💰", label: "Resale" },
];

const FEATURES = [
  "Sunroof", "ADAS", "360 Camera", "Ventilated seats",
  "Wireless CarPlay", "7 Airbags", "AWD", "Fast charging",
];

interface StepPreferencesProps {
  answers: Partial<AdvisorAnswers>;
  onChange: (partial: Partial<AdvisorAnswers>) => void;
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all ${
        active
          ? "bg-brand-navy text-white border-brand-navy"
          : "bg-white text-gray-700 border-gray-200 hover:border-brand-navy hover:text-brand-navy"
      }`}
    >
      {children}
    </button>
  );
}

export function StepPreferences({ answers, onChange }: StepPreferencesProps) {
  const fuels = answers.fuelPreference ?? ["any"];
  const transmission = answers.transmission ?? "any";
  const seats = answers.seatsNeeded ?? 5;
  const priority = answers.prioritize;
  const must = answers.mustHaveFeatures ?? [];

  const toggleFuel = (f: FuelType | "any") => {
    if (f === "any") { onChange({ fuelPreference: ["any"] }); return; }
    const next = fuels.includes(f as FuelType)
      ? fuels.filter((x) => x !== f)
      : [...fuels.filter((x) => x !== "any"), f as FuelType];
    onChange({ fuelPreference: next.length ? next : ["any"] });
  };

  const toggleFeature = (feat: string) => {
    const key = feat.toLowerCase();
    const next = must.includes(key) ? must.filter((x) => x !== key) : [...must, key];
    onChange({ mustHaveFeatures: next });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-brand-navy mb-1">Fine-tune your preferences</h2>
        <p className="text-sm text-gray-500">All optional. Skip anytime.</p>
      </div>

      {/* Fuel */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2">Fuel type</p>
        <div className="flex flex-wrap gap-2">
          {FUELS.map(({ id, label }) => (
            <Chip key={id} active={id === "any" ? fuels.includes("any") : fuels.includes(id as FuelType)} onClick={() => toggleFuel(id)}>
              {label}
            </Chip>
          ))}
        </div>
      </div>

      {/* Transmission */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2">Transmission</p>
        <div className="flex flex-wrap gap-2">
          {TRANSMISSIONS.map(({ id, label }) => (
            <Chip key={id} active={transmission === id} onClick={() => onChange({ transmission: id })}>
              {label}
            </Chip>
          ))}
        </div>
      </div>

      {/* Seats */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2">Minimum seats</p>
        <div className="flex gap-2">
          {SEATS.map((s) => (
            <Chip key={s} active={seats === s} onClick={() => onChange({ seatsNeeded: s })}>
              {s === 7 ? "7+" : s}
            </Chip>
          ))}
        </div>
      </div>

      {/* Priority */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2">Top priority</p>
        <div className="flex flex-wrap gap-2">
          {PRIORITIES.map(({ id, icon, label }) => (
            <Chip key={id} active={priority === id} onClick={() => onChange({ prioritize: id })}>
              {icon} {label}
            </Chip>
          ))}
        </div>
      </div>

      {/* Must-haves */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2">Must-have features</p>
        <div className="flex flex-wrap gap-2">
          {FEATURES.map((f) => (
            <Chip key={f} active={must.includes(f.toLowerCase())} onClick={() => toggleFeature(f)}>
              {f}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  );
}
