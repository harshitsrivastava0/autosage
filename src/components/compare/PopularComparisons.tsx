import Link from "next/link";
import type { Car } from "@/types";
import { CARS } from "@/lib/cars/dataset";

const PAIRS: [string, string][] = [
  ["maruti-baleno", "maruti-fronx"],
  ["tata-punch", "tata-nexon"],
  ["hyundai-creta", "kia-seltos"],
  ["maruti-grand-vitara", "hyundai-creta"],
  ["hyundai-verna", "honda-city"],
  ["tata-nexon-ev", "tata-tiago-ev"],
];

function fmtLakhs(n: number) {
  return `₹${(n / 100000).toFixed(0)}L`;
}

function PairCard({ car1, car2 }: { car1: Car; car2: Car }) {
  const href = `/compare?cars=${car1.id},${car2.id}`;
  return (
    <Link
      href={href}
      className="flex flex-col bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-md hover:-translate-y-0.5 transition-all"
    >
      <div className="flex items-center justify-center gap-3 mb-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={car1.imageUrl} alt={car1.model} className="w-20 h-14 object-contain"
          onError={(e) => { (e.target as HTMLImageElement).src = `/cars/${car1.bodyType}-placeholder.svg`; }} />
        <span className="text-gray-300 font-bold">vs</span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={car2.imageUrl} alt={car2.model} className="w-20 h-14 object-contain"
          onError={(e) => { (e.target as HTMLImageElement).src = `/cars/${car2.bodyType}-placeholder.svg`; }} />
      </div>
      <div className="flex items-center justify-between text-xs text-gray-700 mb-3">
        <div className="text-center flex-1">
          <p className="font-semibold">{car1.model}</p>
          <p className="text-gray-400">{fmtLakhs(car1.priceRange.min)}–{fmtLakhs(car1.priceRange.max)}</p>
        </div>
        <div className="text-center flex-1">
          <p className="font-semibold">{car2.model}</p>
          <p className="text-gray-400">{fmtLakhs(car2.priceRange.min)}–{fmtLakhs(car2.priceRange.max)}</p>
        </div>
      </div>
      <span className="text-xs text-center text-brand-blue font-medium">Compare →</span>
    </Link>
  );
}

export function PopularComparisons() {
  const pairs = PAIRS
    .map(([id1, id2]) => [CARS.find((c) => c.id === id1), CARS.find((c) => c.id === id2)] as [Car | undefined, Car | undefined])
    .filter(([c1, c2]) => c1 && c2) as [Car, Car][];

  return (
    <div>
      <h2 className="text-lg font-bold text-brand-navy mb-4">Popular comparisons</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {pairs.map(([car1, car2]) => (
          <PairCard key={`${car1.id}-${car2.id}`} car1={car1} car2={car2} />
        ))}
      </div>
    </div>
  );
}
