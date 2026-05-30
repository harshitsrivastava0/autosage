"use client";

import { useState } from "react";
import { getOnRoadPrice } from "@/lib/cars/onroad";

/** Format rupees as "₹13.94L" */
function toLakhs(n: number): string {
  return `₹${(n / 100_000).toFixed(2)}L`;
}

interface PriceDisplayProps {
  exShowroom: number;
  city: string;
  showToggle?: boolean;
  className?: string;
}

/** Displays on-road or ex-showroom price with optional animated toggle */
export function PriceDisplay({ exShowroom, city, showToggle = false, className = "" }: PriceDisplayProps) {
  const [showOnRoad, setShowOnRoad] = useState(true);
  const breakdown = getOnRoadPrice(exShowroom, city);
  const cityLabel = city.charAt(0).toUpperCase() + city.slice(1);

  const displayPrice = showOnRoad ? breakdown.total : exShowroom;
  const label = showOnRoad
    ? `on-road · ${cityLabel}`
    : "ex-showroom";

  return (
    <div className={`inline-flex flex-col gap-0.5 ${className}`}>
      <span className={`price font-semibold text-brand-navy transition-all duration-200 ${showOnRoad ? "text-xl" : "text-lg text-gray-600"}`}>
        {toLakhs(displayPrice)}{" "}
        <span className={`font-normal text-sm ${showOnRoad ? "text-gray-500" : "text-gray-400"}`}>
          {label}
        </span>
      </span>

      {showToggle && (
        <button
          onClick={() => setShowOnRoad((v) => !v)}
          className="text-xs text-brand-blue underline underline-offset-2 hover:text-brand-navy transition-colors text-left"
          aria-label={showOnRoad ? "Show ex-showroom price" : "Show on-road price"}
        >
          {showOnRoad ? `${toLakhs(exShowroom)} ex-showroom` : `${toLakhs(breakdown.total)} on-road (${cityLabel})`}
        </button>
      )}
    </div>
  );
}
