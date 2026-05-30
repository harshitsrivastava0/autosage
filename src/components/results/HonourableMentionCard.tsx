"use client";

import Link from "next/link";
import type { HonourableMention } from "@/types";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { useCity } from "@/hooks/useCity";
import { useCompare } from "@/hooks/useCompare";

interface HonourableMentionCardProps {
  item: HonourableMention;
}

/** Simpler card for cars that didn't make the top 3 but are worth mentioning. */
export function HonourableMentionCard({ item }: HonourableMentionCardProps) {
  const { city } = useCity();
  const { selectedIds, addCar, removeCar, canAdd } = useCompare();

  const car = item.car;
  if (!car) return null;

  const isInCompare = selectedIds.includes(car.id);

  return (
    <div className="flex items-center gap-4 bg-white border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={car.imageUrl}
        alt={`${car.make} ${car.model}`}
        className="w-20 h-14 object-contain shrink-0"
        onError={(e) => { (e.target as HTMLImageElement).src = `/cars/${car.bodyType}-placeholder.svg`; }}
      />

      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 uppercase tracking-wide">{car.make}</p>
        <p className="font-semibold text-brand-navy text-sm">{car.model}</p>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.oneLineReason}</p>
      </div>

      <div className="flex flex-col items-end gap-2 shrink-0">
        <PriceDisplay exShowroom={car.exShowroomPrice} city={city} showToggle={false} />
        <div className="flex gap-1.5">
          <Link
            href={`/car/${car.id}`}
            className="text-xs text-brand-blue border border-brand-blue rounded-lg px-2.5 py-1 hover:bg-brand-blue hover:text-white transition-colors"
          >
            Details
          </Link>
          <button
            onClick={() => (isInCompare ? removeCar(car.id) : addCar(car.id))}
            disabled={!isInCompare && !canAdd}
            className={`text-xs rounded-lg px-2.5 py-1 transition-colors ${
              isInCompare
                ? "bg-brand-navy text-white"
                : canAdd
                ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                : "bg-gray-100 text-gray-300 cursor-not-allowed"
            }`}
          >
            {isInCompare ? "✓" : "Compare"}
          </button>
        </div>
      </div>
    </div>
  );
}
