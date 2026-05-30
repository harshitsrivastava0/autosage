"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { CompareTable } from "@/components/compare/CompareTable";
import { PopularComparisons } from "@/components/compare/PopularComparisons";
import { useCompare } from "@/hooks/useCompare";
import { CARS } from "@/lib/cars/dataset";
import type { Car } from "@/types";

function CompareContent() {
  const searchParams = useSearchParams();
  const { selectedIds } = useCompare();
  const [cars, setCars] = useState<Car[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const paramCars = searchParams.get("cars");
    let ids: string[] = [];

    if (paramCars) {
      ids = paramCars.split(",").filter(Boolean).slice(0, 4);
    } else {
      ids = selectedIds.slice(0, 4);
    }

    const resolved = ids
      .map((id) => CARS.find((c) => c.id === id))
      .filter(Boolean) as Car[];
    setCars(resolved);
  }, [searchParams, selectedIds]);

  const filtered = searchQuery
    ? CARS.filter((c) =>
        `${c.make} ${c.model}`.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !cars.some((selected) => selected.id === c.id)
      ).slice(0, 6)
    : [];

  const addCar = (car: Car) => {
    if (cars.length >= 4) return;
    setCars((prev) => [...prev, car]);
    setSearchQuery("");
  };

  const removeCar = (id: string) => {
    setCars((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 w-full space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-brand-navy mb-1">Car comparison</h1>
        <p className="text-sm text-gray-500">Compare up to 4 cars side by side with AI-powered verdict.</p>
      </div>

      {/* Car picker */}
      <div className="flex flex-wrap items-center gap-3">
        {cars.map((car) => (
          <div key={car.id} className="flex items-center gap-2 bg-brand-navy/5 border border-brand-navy/10 rounded-full px-3 py-1.5">
            <span className="text-sm font-medium text-brand-navy">{car.model}</span>
            <button
              onClick={() => removeCar(car.id)}
              className="text-gray-400 hover:text-brand-red transition-colors"
              aria-label={`Remove ${car.model}`}
            >
              ×
            </button>
          </div>
        ))}
        {cars.length < 4 && (
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="+ Add car…"
              className="text-sm border border-gray-200 rounded-full px-4 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-blue w-40"
            />
            {filtered.length > 0 && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 min-w-48 py-1">
                {filtered.map((car) => (
                  <button
                    key={car.id}
                    onClick={() => addCar(car)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    {car.make} {car.model}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {cars.length >= 2 ? (
        <CompareTable cars={cars} />
      ) : (
        <div className="text-center py-16 space-y-3">
          <p className="text-4xl">🔄</p>
          <p className="text-gray-500 text-sm">Add at least 2 cars above to start comparing.</p>
        </div>
      )}

      <PopularComparisons />
    </main>
  );
}

export default function ComparePage() {
  return (
    <div className="flex flex-col min-h-full">
      <Header />
      <Suspense fallback={<div className="flex-1 flex items-center justify-center text-gray-400 text-sm">Loading…</div>}>
        <CompareContent />
      </Suspense>
    </div>
  );
}
