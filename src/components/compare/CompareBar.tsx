"use client";

import { useRouter } from "next/navigation";
import { useCompare } from "@/hooks/useCompare";
import { CARS } from "@/lib/cars/dataset";

export function CompareBar() {
  const { selectedIds, removeCar, clearAll, canAdd } = useCompare();
  const router = useRouter();

  if (selectedIds.length < 2) return null;

  const cars = selectedIds.map((id) => CARS.find((c) => c.id === id)).filter(Boolean);

  const handleCompare = () => {
    router.push(`/compare?cars=${selectedIds.join(",")}`);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-brand-navy text-white shadow-2xl border-t border-brand-navy/50 animate-[slideIn_0.3s_ease-out_both]">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
        {/* Car thumbnails */}
        <div className="flex items-center gap-2 flex-1 overflow-x-auto">
          {cars.map((car) => car && (
            <div key={car.id} className="relative flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={car.imageUrl}
                alt={car.model}
                className="w-14 h-10 object-contain bg-white/10 rounded-lg"
                onError={(e) => { (e.target as HTMLImageElement).src = `/cars/${car.bodyType}-placeholder.svg`; }}
              />
              <button
                onClick={() => removeCar(car.id)}
                className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 bg-brand-red rounded-full text-white text-[10px] flex items-center justify-center hover:bg-red-600 transition-colors"
                aria-label={`Remove ${car.model}`}
              >
                ×
              </button>
              <p className="text-[10px] text-white/70 text-center mt-0.5 max-w-[56px] truncate">{car.model}</p>
            </div>
          ))}

          {/* Add slot */}
          {canAdd && (
            <div className="flex-shrink-0 w-14 h-10 border-2 border-dashed border-white/30 rounded-lg flex items-center justify-center text-white/40 text-lg">
              +
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={clearAll}
            className="text-xs text-white/60 hover:text-white transition-colors px-2 py-1.5"
          >
            Clear
          </button>
          <button
            onClick={handleCompare}
            className="bg-white text-brand-navy font-semibold text-sm px-5 py-2 rounded-full hover:bg-white/90 transition-colors whitespace-nowrap"
          >
            Compare {selectedIds.length} cars →
          </button>
        </div>
      </div>
    </div>
  );
}
