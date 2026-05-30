"use client";

import { useState } from "react";
import type { ShortlistItem, HonourableMention } from "@/types";
import { useCity } from "@/hooks/useCity";
import { CitySelector } from "@/components/ui/CitySelector";
import { ChatDrawer } from "@/components/chat/ChatDrawer";
import { toast } from "@/components/ui/ToastProvider";
import { CarCard } from "./CarCard";
import { HonourableMentionCard } from "./HonourableMentionCard";

interface ResultsSectionProps {
  shortlist: ShortlistItem[];
  honourableMentions: HonourableMention[];
  summary?: string;
  budgetInsight?: string;
  cityNote?: string;
  sessionId?: string;
  onRefine?: () => void;
  /** When true: hides Refine, Share, chat drawer; shows read-only banner */
  readonly?: boolean;
  /** Owner's city for read-only banner */
  ownerCity?: string;
}

export function ResultsSection({
  shortlist,
  honourableMentions,
  summary,
  budgetInsight,
  cityNote,
  sessionId,
  onRefine,
  readonly = false,
  ownerCity,
}: ResultsSectionProps) {
  const { city } = useCity();
  const [showCitySelector, setShowCitySelector] = useState(false);
  const cityLabel = city.charAt(0).toUpperCase() + city.slice(1);

  const topScore = shortlist[0]?.matchScore ?? 100;
  const showBudgetNudge = !readonly && topScore < 85;

  const copyShareLink = () => {
    if (!shortlist.length) return;
    const carsParam = shortlist.map((item) => `${item.carId}:${item.matchScore}`).join(",");
    const url = `${window.location.origin}/shortlist?cars=${encodeURIComponent(carsParam)}`;
    navigator.clipboard.writeText(url).then(() => {
      toast("Link copied! Share with family or friends.", "success");
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Read-only banner */}
      {readonly && ownerCity && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2">
          <span className="text-amber-500">📋</span>
          <p className="text-sm text-amber-800">
            Viewing a shared shortlist for <span className="font-semibold capitalize">{ownerCity}</span>.
            Switch your city below for your own on-road prices.
          </p>
        </div>
      )}

      {/* Sticky header */}
      <div className="sticky top-14 z-30 bg-white/95 backdrop-blur -mx-4 px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-3">
        <div>
          <h1 className="font-bold text-brand-navy text-lg">
            {readonly ? "Shared shortlist" : `Your shortlist for ${cityLabel}`}
          </h1>
          {cityNote && <p className="text-xs text-gray-400">{cityNote}</p>}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCitySelector((v) => !v)}
            className="text-xs text-gray-500 border border-gray-200 rounded-full px-3 py-1.5 hover:border-brand-navy hover:text-brand-navy transition-colors"
          >
            📍 {cityLabel}
          </button>
          {!readonly && onRefine && (
            <button
              onClick={onRefine}
              className="text-xs bg-gray-100 text-gray-700 rounded-full px-3 py-1.5 hover:bg-gray-200 transition-colors"
            >
              Refine ⚙
            </button>
          )}
          {!readonly && shortlist.length > 0 && (
            <button
              onClick={copyShareLink}
              className="text-xs bg-brand-navy text-white rounded-full px-3 py-1.5 hover:bg-brand-navy/90 transition-colors"
            >
              Share
            </button>
          )}
        </div>
      </div>

      {/* City selector flyout */}
      {showCitySelector && (
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-sm font-medium text-gray-700 mb-3">Change city (updates all prices)</p>
          <CitySelector variant="buttons" onChange={() => setShowCitySelector(false)} />
        </div>
      )}

      {/* AI summary */}
      {summary && (
        <div className="bg-brand-navy/5 rounded-xl p-4 border border-brand-navy/10">
          <p className="text-sm text-brand-navy leading-relaxed">{summary}</p>
        </div>
      )}

      {/* Budget insight */}
      {budgetInsight && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <span className="text-amber-500 text-lg shrink-0">💡</span>
          <p className="text-sm text-amber-800">{budgetInsight}</p>
        </div>
      )}

      {/* Budget nudge */}
      {showBudgetNudge && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <span className="text-brand-blue text-lg shrink-0">💸</span>
          <div>
            <p className="text-sm text-brand-blue font-medium">Increase budget by ₹1.5L?</p>
            <p className="text-xs text-blue-600 mt-0.5">Your top match scores {topScore}%. A slightly higher budget unlocks premium variant features.</p>
          </div>
        </div>
      )}

      {/* 3 main cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {shortlist.map((item, i) => (
          <CarCard
            key={item.carId}
            item={item}
            animationDelay={i * 150}
          />
        ))}
      </div>

      {/* Honourable mentions */}
      {honourableMentions.length > 0 && (
        <div>
          <h2 className="font-semibold text-gray-700 text-sm mb-3">Also worth considering</h2>
          <div className="space-y-3">
            {honourableMentions.map((item) => (
              <HonourableMentionCard key={item.carId} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* Floating chat drawer — hidden in read-only mode */}
      {!readonly && <ChatDrawer shortlist={shortlist} context="results" />}
    </div>
  );
}
