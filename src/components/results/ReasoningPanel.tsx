"use client";

import { useState } from "react";

interface ReasoningPanelProps {
  reasons: string[];
  tradeoffs: string[];
  variantRecommendation: string;
  avoidVariant: string;
}

/** Collapsible panel showing AI reasoning — reasons, tradeoffs, variant guidance. */
export function ReasoningPanel({ reasons, tradeoffs, variantRecommendation, avoidVariant }: ReasoningPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <span>Why this car?</span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-100">
          {/* Reasons */}
          {reasons.length > 0 && (
            <ul className="space-y-1.5 pt-3">
              {reasons.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Tradeoffs */}
          {tradeoffs.length > 0 && (
            <ul className="space-y-1.5">
              {tradeoffs.map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-500">
                  <span className="text-amber-400 mt-0.5 shrink-0">⚠</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Variant guidance */}
          {variantRecommendation && (
            <div className="bg-green-50 rounded-lg p-2.5 text-xs text-green-800">
              <span className="font-semibold">Get: </span>{variantRecommendation}
            </div>
          )}
          {avoidVariant && (
            <div className="bg-amber-50 rounded-lg p-2.5 text-xs text-amber-800">
              <span className="font-semibold">Avoid: </span>{avoidVariant}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
