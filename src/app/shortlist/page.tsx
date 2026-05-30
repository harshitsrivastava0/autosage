"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { ResultsSection } from "@/components/results/ResultsSection";
import { getCarById } from "@/lib/cars/dataset";
import { getOnRoadPrice } from "@/lib/cars/onroad";
import type { ShortlistItem, MonthlyCost } from "@/types";

function buildShortlistItem(carId: string, matchScore: number, rank: number): ShortlistItem | null {
  const car = getCarById(carId);
  if (!car) return null;

  const loan = car.exShowroomPrice * 0.85;
  const r = 0.085 / 12;
  const n = 60;
  const emi = Math.round((loan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
  const fuelPrice = car.fuelType === "diesel" ? 90 : car.fuelType === "cng" ? 90 : car.fuelType === "electric" ? 8 : 103;
  const monthlyKm = 1200;
  const fuelMonthly = car.fuelType === "electric"
    ? Math.round((monthlyKm / (car.realWorldMileageKmpl / 100)) * fuelPrice)
    : Math.round((monthlyKm / car.realWorldMileageKmpl) * fuelPrice);

  const monthlyCost: MonthlyCost = {
    emiAt85Pct: emi,
    fuelMonthly,
    insuranceMonthly: Math.round(car.insuranceAnnual / 12),
    totalMonthly: emi + fuelMonthly + Math.round(car.insuranceAnnual / 12),
  };

  return {
    carId,
    rank,
    matchScore,
    headline: car.expertSummary.split(".")[0],
    reasons: car.pros,
    tradeoffs: car.cons,
    bestFor: car.targetBuyer,
    variantRecommendation: car.allVariants.find((v) => v.isTopSelling)?.name ?? car.variant,
    avoidVariant: car.allVariants[0]?.name ?? "base trim",
    monthlyCost,
    vsCategory: `${car.overallRating}/5 rated`,
    car,
  };
}

function ShortlistContent() {
  const searchParams = useSearchParams();
  const carsParam = searchParams.get("cars");

  if (!carsParam) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center gap-6 px-4 text-center">
        <p className="text-5xl">📋</p>
        <h1 className="text-2xl font-bold text-brand-navy">No shortlist found</h1>
        <p className="text-gray-500 text-sm max-w-sm">
          This link may be invalid or the shortlist was not shared correctly.
        </p>
        <Link
          href="/advisor"
          className="bg-brand-red text-white font-semibold px-7 py-3 rounded-full hover:bg-brand-red/90 transition-colors"
        >
          Create my own shortlist →
        </Link>
      </main>
    );
  }

  const entries = carsParam.split(",").filter(Boolean);
  const shortlist: ShortlistItem[] = [];

  entries.forEach((entry, idx) => {
    const [carId, scoreStr] = entry.split(":");
    const matchScore = parseInt(scoreStr ?? "80", 10);
    const item = buildShortlistItem(carId, isNaN(matchScore) ? 80 : matchScore, idx + 1);
    if (item) shortlist.push(item);
  });

  if (shortlist.length === 0) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center gap-6 px-4 text-center">
        <p className="text-5xl">📋</p>
        <h1 className="text-2xl font-bold text-brand-navy">Shortlist not found</h1>
        <p className="text-gray-500 text-sm max-w-sm">
          This link may have expired or the cars are no longer in our database.
        </p>
        <Link
          href="/advisor"
          className="bg-brand-red text-white font-semibold px-7 py-3 rounded-full hover:bg-brand-red/90 transition-colors"
        >
          Create my own shortlist →
        </Link>
      </main>
    );
  }

  // Infer city from on-road price context (default delhi for shared links)
  const ownerCity = "delhi";

  return (
    <main className="flex-1">
      <ResultsSection
        shortlist={shortlist}
        honourableMentions={[]}
        readonly
        ownerCity={ownerCity}
      />
    </main>
  );
}

export default function ShortlistPage() {
  return (
    <div className="flex flex-col min-h-full">
      <Header />
      <Suspense fallback={<div className="flex-1 flex items-center justify-center text-gray-400 text-sm">Loading…</div>}>
        <ShortlistContent />
      </Suspense>
    </div>
  );
}
