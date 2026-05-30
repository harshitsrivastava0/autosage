"use client";

import { useState } from "react";
import type { Variant } from "@/types";

interface VariantSelectorProps {
  variants: Variant[];
  selectedIndex?: number;
  onChange?: (variant: Variant, index: number) => void;
}

function fmtLakhs(n: number) {
  return `₹${(n / 100000).toFixed(2)}L`;
}

/** Dropdown showing all variants with price; notifies parent on change. */
export function VariantSelector({ variants, selectedIndex = 0, onChange }: VariantSelectorProps) {
  const [idx, setIdx] = useState(selectedIndex);

  if (!variants || variants.length === 0) return null;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const i = parseInt(e.target.value, 10);
    setIdx(i);
    onChange?.(variants[i], i);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400 shrink-0">Variant</span>
      <select
        value={idx}
        onChange={handleChange}
        className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-brand-blue"
      >
        {variants.map((v, i) => (
          <option key={i} value={i}>
            {v.name} — {fmtLakhs(v.exShowroomPrice)} ({v.fuelType}, {v.transmission})
            {v.isTopSelling ? " ★ Best seller" : ""}
          </option>
        ))}
      </select>
    </div>
  );
}
