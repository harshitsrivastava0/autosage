"use client";

import { useState } from "react";
import { useCity } from "@/hooks/useCity";

const QUICK_CITIES = ["delhi", "mumbai", "bangalore", "chennai", "hyderabad", "pune"];
const ALL_CITIES = [
  ...QUICK_CITIES,
  "ahmedabad", "kolkata", "jaipur", "lucknow",
];

const CITY_LABELS: Record<string, string> = {
  delhi: "Delhi",
  mumbai: "Mumbai",
  bangalore: "Bangalore",
  chennai: "Chennai",
  hyderabad: "Hyderabad",
  pune: "Pune",
  ahmedabad: "Ahmedabad",
  kolkata: "Kolkata",
  jaipur: "Jaipur",
  lucknow: "Lucknow",
};

interface CitySelectorProps {
  variant?: "buttons" | "dropdown";
  onChange?: () => void;
}

/**
 * City selector for on-road price context.
 * "buttons" mode: quick-select chips for top 6 cities + "Other" overflow.
 * "dropdown" mode: full <select> with all 10 supported cities.
 */
export function CitySelector({ variant = "buttons", onChange }: CitySelectorProps) {
  const { city, setCity } = useCity();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSelect = (c: string) => {
    setCity(c);
    setShowDropdown(false);
    onChange?.();
  };

  if (variant === "dropdown") {
    return (
      <select
        value={city}
        onChange={(e) => handleSelect(e.target.value)}
        className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
        aria-label="Select city for on-road price"
      >
        {ALL_CITIES.map((c) => (
          <option key={c} value={c}>
            {CITY_LABELS[c]}
          </option>
        ))}
      </select>
    );
  }

  // Buttons mode
  return (
    <div className="flex flex-wrap gap-2">
      {QUICK_CITIES.map((c) => (
        <button
          key={c}
          onClick={() => handleSelect(c)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
            city === c
              ? "bg-brand-navy text-white border-brand-navy"
              : "bg-white text-gray-700 border-gray-200 hover:border-brand-navy hover:text-brand-navy"
          }`}
        >
          {CITY_LABELS[c]}
        </button>
      ))}

      {/* Other → shows full dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown((v) => !v)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
            !QUICK_CITIES.includes(city)
              ? "bg-brand-navy text-white border-brand-navy"
              : "bg-white text-gray-700 border-gray-200 hover:border-brand-navy hover:text-brand-navy"
          }`}
        >
          {!QUICK_CITIES.includes(city) ? CITY_LABELS[city] : "Other ▾"}
        </button>

        {showDropdown && (
          <div className="absolute top-full left-0 mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[140px]">
            {ALL_CITIES.filter((c) => !QUICK_CITIES.includes(c)).map((c) => (
              <button
                key={c}
                onClick={() => handleSelect(c)}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                {CITY_LABELS[c]}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
