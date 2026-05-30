"use client";

import Link from "next/link";
import { useState } from "react";
import type { Car, MonthlyCost, ShortlistItem, Variant } from "@/types";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { useCity } from "@/hooks/useCity";
import { useCompare } from "@/hooks/useCompare";
import { CarImage } from "./CarImage";
import { SentimentBar } from "./SentimentBar";
import { MonthlyCostBreakdown } from "./MonthlyCostBreakdown";
import { VariantSelector } from "./VariantSelector";
import { ReasoningPanel } from "./ReasoningPanel";

interface CarCardProps {
  /** Full ShortlistItem from AI response */
  item?: ShortlistItem;
  /** Static car object — used when displaying a sample card with no AI output */
  car?: Car;
  /** When true, renders from static props — no animations or context calls */
  static?: boolean;
  /** Override match score for static mode */
  matchScore?: number;
  /** Override monthly cost for static mode */
  monthlyCost?: Partial<MonthlyCost>;
  /** Stagger delay in ms for fadeUp animation */
  animationDelay?: number;
  className?: string;
}

const SENTIMENT_KEYS: (keyof Car["sentimentScores"])[] = [
  "mileage", "performance", "looks", "comfort", "engine", "interior", "power",
];

const FUEL_LABELS: Record<string, string> = {
  petrol: "⛽ Petrol",
  diesel: "🛢 Diesel",
  electric: "⚡ Electric",
  hybrid: "♻ Hybrid",
  cng: "🌿 CNG",
};

export function CarCard({
  item,
  car: carProp,
  static: isStatic,
  matchScore,
  monthlyCost: mcOverride,
  animationDelay = 0,
  className = "",
}: CarCardProps) {
  const { city } = useCity();
  const { selectedIds, addCar, removeCar, canAdd } = useCompare();

  const baseCar = item?.car ?? carProp;
  if (!baseCar) return null;

  const [activeCar, setActiveCar] = useState<Car>(baseCar);

  const score = item?.matchScore ?? matchScore ?? Math.round(baseCar.overallRating * 20);
  const headline = item?.headline ?? baseCar.expertSummary.split(".")[0];
  const reasons = item?.reasons ?? baseCar.pros;
  const tradeoffs = item?.tradeoffs ?? baseCar.cons;
  const variantRec = item?.variantRecommendation ?? "";
  const avoidVariant = item?.avoidVariant ?? "";

  const mc: MonthlyCost = item?.monthlyCost ?? {
    emiAt85Pct: mcOverride?.emiAt85Pct ?? Math.round(
      (activeCar.exShowroomPrice * 0.85 * (0.085 / 12) * Math.pow(1 + 0.085 / 12, 60)) /
      (Math.pow(1 + 0.085 / 12, 60) - 1)
    ),
    fuelMonthly: mcOverride?.fuelMonthly ?? Math.round((1200 / activeCar.realWorldMileageKmpl) * 103),
    insuranceMonthly: mcOverride?.insuranceMonthly ?? Math.round(activeCar.insuranceAnnual / 12),
    totalMonthly: mcOverride?.totalMonthly ?? 0,
  };
  const totalMonthly = mc.totalMonthly || mc.emiAt85Pct + mc.fuelMonthly + mc.insuranceMonthly;

  const isInCompare = selectedIds.includes(activeCar.id);
  const isTopPick = item?.rank === 1;
  const [showAllBars, setShowAllBars] = useState(false);
  const visibleBars = showAllBars ? SENTIMENT_KEYS : SENTIMENT_KEYS.slice(0, 4);

  const handleVariantChange = (v: Variant) => {
    setActiveCar({ ...activeCar, exShowroomPrice: v.exShowroomPrice, mileageKmpl: v.mileageKmpl, fuelType: v.fuelType, transmission: v.transmission });
  };

  return (
    <article
      className={`
        bg-white rounded-2xl shadow-sm border border-gray-100
        hover:shadow-md hover:-translate-y-0.5 transition-all duration-200
        overflow-hidden
        ${!isStatic ? "animate-[fadeUp_0.4s_ease-out_both]" : ""}
        ${className}
      `}
      style={!isStatic ? { animationDelay: `${animationDelay}ms` } : undefined}
    >
      {/* Image */}
      <div className="relative">
        <CarImage
          src={activeCar.imageUrl}
          alt={`${activeCar.make} ${activeCar.model}`}
          bodyType={activeCar.bodyType}
          className="h-48"
        />

        {/* Rank / Top Pick badge */}
        {isTopPick && (
          <div className="absolute top-3 left-3 bg-brand-red text-white text-xs font-bold px-2.5 py-1 rounded-full shadow animate-pop-in">
            #1 Top Pick
          </div>
        )}
        {item?.rank && item.rank > 1 && (
          <div className="absolute top-3 left-3 bg-brand-navy text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
            #{item.rank}
          </div>
        )}

        {/* Match score */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-brand-navy text-sm font-bold px-2.5 py-1 rounded-full shadow">
          {score}% match
        </div>

        {/* Waiting period */}
        {activeCar.waitingPeriodWeeks && (
          <div className="absolute bottom-3 left-3 bg-amber-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
            {activeCar.waitingPeriodWeeks}w wait
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {/* Identity */}
        <div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">{activeCar.make}</p>
              <h3 className="font-bold text-brand-navy text-lg leading-tight">{activeCar.model}</h3>
            </div>
            <PriceDisplay exShowroom={activeCar.exShowroomPrice} city={city} showToggle />
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-amber-400 text-sm">★</span>
            <span className="text-sm font-semibold text-gray-700">{activeCar.overallRating}</span>
            <span className="text-xs text-gray-400">({activeCar.reviewCount.toLocaleString("en-IN")} reviews)</span>
          </div>

          {headline && (
            <p className="text-sm text-gray-600 mt-1.5 leading-snug">{headline}</p>
          )}
        </div>

        {/* Spec pills */}
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs bg-gray-50 border border-gray-100 rounded-full px-2.5 py-0.5 text-gray-600">
            {FUEL_LABELS[activeCar.fuelType] ?? activeCar.fuelType}
          </span>
          <span className="text-xs bg-gray-50 border border-gray-100 rounded-full px-2.5 py-0.5 text-gray-600">
            {activeCar.mileageKmpl} kmpl
          </span>
          <span className="text-xs bg-gray-50 border border-gray-100 rounded-full px-2.5 py-0.5 text-gray-600">
            {activeCar.seatingCapacity} seats
          </span>
          <span className="text-xs bg-gray-50 border border-gray-100 rounded-full px-2.5 py-0.5 text-gray-600 capitalize">
            {activeCar.transmission}
          </span>
        </div>

        {/* Sentiment bars */}
        {!isStatic && (
          <div className="space-y-1.5">
            {visibleBars.map((key) => (
              <SentimentBar key={key} label={key} score={activeCar.sentimentScores[key]} />
            ))}
            {SENTIMENT_KEYS.length > 4 && (
              <button
                onClick={() => setShowAllBars((v) => !v)}
                className="text-xs text-brand-blue hover:underline"
              >
                {showAllBars ? "Show less" : "Show all 7 ▾"}
              </button>
            )}
          </div>
        )}

        {/* Static-mode condensed bars */}
        {isStatic && (
          <div className="space-y-1.5">
            {SENTIMENT_KEYS.slice(0, 4).map((key) => (
              <SentimentBar key={key} label={key} score={activeCar.sentimentScores[key]} />
            ))}
          </div>
        )}

        {/* Monthly cost */}
        <MonthlyCostBreakdown
          emiAt85Pct={mc.emiAt85Pct}
          fuelMonthly={mc.fuelMonthly}
          insuranceMonthly={mc.insuranceMonthly}
          totalMonthly={totalMonthly}
        />

        {/* Reasoning panel — only in AI mode */}
        {!isStatic && (reasons.length > 0 || tradeoffs.length > 0) && (
          <ReasoningPanel
            reasons={reasons}
            tradeoffs={tradeoffs}
            variantRecommendation={variantRec}
            avoidVariant={avoidVariant}
          />
        )}

        {/* Static-mode reasons preview */}
        {isStatic && reasons.length > 0 && (
          <ul className="space-y-1">
            {reasons.slice(0, 2).map((r, i) => (
              <li key={i} className="flex items-start gap-1.5 text-sm text-gray-700">
                <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Variant selector */}
        {!isStatic && activeCar.allVariants && activeCar.allVariants.length > 1 && (
          <VariantSelector
            variants={activeCar.allVariants}
            onChange={handleVariantChange}
          />
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Link
            href={`/car/${activeCar.id}`}
            className="flex-1 text-center text-sm font-medium text-brand-blue border border-brand-blue rounded-lg py-2 hover:bg-brand-blue hover:text-white transition-colors"
          >
            View details →
          </Link>
          <button
            onClick={() => (isInCompare ? removeCar(activeCar.id) : addCar(activeCar.id))}
            disabled={!isInCompare && !canAdd}
            className={`flex-1 text-sm font-medium rounded-lg py-2 transition-colors ${
              isInCompare
                ? "bg-brand-navy text-white hover:bg-brand-navy/80"
                : canAdd
                ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                : "bg-gray-100 text-gray-300 cursor-not-allowed"
            }`}
          >
            {isInCompare ? "✓ Compare" : "Compare"}
          </button>
        </div>
      </div>
    </article>
  );
}
