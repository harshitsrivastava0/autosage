"use client";

import { useState } from "react";

const COLOUR_MAP: Record<string, string> = {
  black: "#1a1a1a",
  white: "#f5f5f5",
  silver: "#c0c0c0",
  grey: "#808080",
  gray: "#808080",
  red: "#e63946",
  blue: "#2563eb",
  navy: "#1a1a2e",
  green: "#16a34a",
  brown: "#92400e",
  beige: "#d6c5a0",
  orange: "#ea580c",
  yellow: "#ca8a04",
  golden: "#ca8a04",
  gold: "#ca8a04",
  purple: "#7c3aed",
  cosmic: "#2563eb",
  abyss: "#1a1a2e",
  starry: "#1a1a2e",
  atlas: "#f5f5f5",
  polar: "#f5f5f5",
  typhoon: "#c0c0c0",
  fiery: "#e63946",
  blazing: "#ea580c",
  ember: "#ea580c",
  phantom: "#1a1a2e",
  mystery: "#1a1a2e",
  magma: "#e63946",
  mystic: "#7c3aed",
};

function getColourHex(name: string): string {
  const words = name.toLowerCase().split(/[\s-]+/);
  for (const word of words) {
    if (COLOUR_MAP[word]) return COLOUR_MAP[word];
  }
  return "#cccccc";
}

interface ColourPickerProps {
  colours: string[];
}

export function ColourPicker({ colours }: ColourPickerProps) {
  const [selected, setSelected] = useState(0);

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-brand-navy">Available colours</h3>
      <div className="flex flex-wrap gap-3">
        {colours.map((colour, i) => {
          const hex = getColourHex(colour);
          const isLight = hex === "#f5f5f5" || hex === "#d6c5a0";
          return (
            <button
              key={colour}
              onClick={() => setSelected(i)}
              title={colour}
              className={`w-10 h-10 rounded-full border-2 transition-all hover:scale-110 ${
                selected === i
                  ? "ring-2 ring-offset-2 ring-brand-navy border-transparent"
                  : isLight
                  ? "border-gray-200"
                  : "border-transparent"
              }`}
              style={{ backgroundColor: hex }}
            />
          );
        })}
      </div>
      {colours[selected] && (
        <p className="text-sm text-gray-600 font-medium">{colours[selected]}</p>
      )}
      <p className="text-xs text-gray-400">Colours shown are illustrative. Visit dealer for exact shades.</p>
    </div>
  );
}
