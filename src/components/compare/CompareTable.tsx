"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Car, ComparisonResult } from "@/types";
import { useCity } from "@/hooks/useCity";

interface CompareTableProps {
  cars: Car[];
}

function fmtLakhs(n: number) {
  return `₹${(n / 100000).toFixed(2)}L`;
}

function fmt(n: number) {
  return n.toLocaleString("en-IN");
}

function Stars({ count, total = 5 }: { count: number; total?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} className={`text-sm ${i < count ? "text-amber-400" : "text-gray-200"}`}>★</span>
      ))}
    </div>
  );
}

function BarCell({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <span className="text-sm font-medium text-gray-800">{label}</span>
      <div className="w-full h-1 bg-gray-100 rounded mt-1">
        <div className="h-full bg-brand-navy rounded" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-12 bg-gray-100 rounded-xl animate-shimmer" />
      ))}
    </div>
  );
}

export function CompareTable({ cars }: CompareTableProps) {
  const { city } = useCity();
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cars.length < 2) return;
    setLoading(true);
    setError(null);

    fetch("/api/compare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ carIds: cars.map((c) => c.id), city }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status}`);
        return res.json() as Promise<ComparisonResult>;
      })
      .then((data) => { setResult(data); setLoading(false); })
      .catch((err) => { setError(String(err)); setLoading(false); });
  }, [cars.map((c) => c.id).join(","), city]); // eslint-disable-line react-hooks/exhaustive-deps

  if (cars.length < 2) return <p className="text-sm text-gray-500">Select at least 2 cars to compare.</p>;

  const colCount = cars.length;
  const winnerIdx = result?.winnerCarId ? cars.findIndex((c) => c.id === result.winnerCarId) : -1;

  return (
    <div className="space-y-6">
      {/* AI verdict panel */}
      {result && (
        <div className="bg-brand-navy text-white rounded-2xl p-6 space-y-3">
          <p className="text-xs uppercase tracking-widest text-white/50">AutoSage AI Verdict</p>
          <p className="text-sm leading-relaxed">{result.verdict}</p>
          {result.whoShouldBuy && Object.keys(result.whoShouldBuy).length > 0 && (
            <div className={`grid gap-3 mt-3`} style={{ gridTemplateColumns: `repeat(${colCount}, 1fr)` }}>
              {cars.map((car) => (
                <div key={car.id} className="bg-white/10 rounded-xl p-3">
                  <p className="text-xs font-semibold text-white mb-1">{car.model}</p>
                  <p className="text-xs text-white/70">{result.whoShouldBuy[car.id] ?? "—"}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[500px]">
          {/* Header */}
          <thead>
            <tr>
              <th className="w-36 text-left py-3 text-xs font-semibold text-gray-400 uppercase pr-4">Spec</th>
              {cars.map((car, i) => (
                <th
                  key={car.id}
                  className={`py-3 px-2 text-center align-top ${i === winnerIdx ? "bg-blue-50 rounded-t-xl" : ""}`}
                  style={i === winnerIdx ? { boxShadow: "inset 2px 0 0 #2563eb" } : undefined}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={car.imageUrl}
                    alt={car.model}
                    className="w-24 h-16 object-contain mx-auto mb-2"
                    onError={(e) => { (e.target as HTMLImageElement).src = `/cars/${car.bodyType}-placeholder.svg`; }}
                  />
                  <p className="text-xs font-bold text-brand-navy">{car.make}</p>
                  <p className="text-sm font-bold text-brand-navy">{car.model}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{fmtLakhs(car.exShowroomPrice)}</p>
                  {i === winnerIdx && (
                    <span className="inline-block mt-1 text-[10px] bg-brand-blue text-white rounded-full px-2 py-0.5 font-semibold">Best pick</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr><td colSpan={colCount + 1}><Skeleton /></td></tr>
            ) : (
              <>
                {/* Overview */}
                <SectionRow title="Overview" colCount={colCount} />
                <DataRow label="Ex-showroom" values={cars.map((c) => fmtLakhs(c.exShowroomPrice))} winnerIdx={winnerIdx} />
                <DataRow label="Year" values={cars.map((c) => `${c.year}`)} winnerIdx={winnerIdx} />
                <DataRow label="Segment" values={cars.map((c) => c.segment)} winnerIdx={winnerIdx} capitalize />
                <DataRow label="Body type" values={cars.map((c) => c.bodyType)} winnerIdx={winnerIdx} capitalize />

                {/* Performance */}
                <SectionRow title="Performance" colCount={colCount} />
                <NumRow label="Engine" values={cars.map((c) => c.engineCC)} unit="cc" winnerIdx={winnerIdx} higher />
                <NumRow label="Power" values={cars.map((c) => c.powerBhp)} unit="bhp" winnerIdx={winnerIdx} higher />
                <NumRow label="Torque" values={cars.map((c) => c.torqueNm)} unit="Nm" winnerIdx={winnerIdx} higher />

                {/* Efficiency */}
                <SectionRow title="Efficiency" colCount={colCount} />
                <NumRow label="ARAI mileage" values={cars.map((c) => c.mileageKmpl)} unit="km/l" winnerIdx={winnerIdx} higher />
                <NumRow label="Real-world" values={cars.map((c) => c.realWorldMileageKmpl)} unit="km/l" winnerIdx={winnerIdx} higher />
                <NumRow label="Tank / battery" values={cars.map((c) => c.fuelTankLitres)} unit={cars[0]?.fuelType === "electric" ? "kWh" : "L"} winnerIdx={winnerIdx} higher />

                {/* Safety */}
                <SectionRow title="Safety" colCount={colCount} />
                <tr className="border-b border-gray-50">
                  <td className="py-3 pr-4 text-sm text-gray-500">NCAP rating</td>
                  {cars.map((car, i) => (
                    <td key={car.id} className={`py-3 px-2 text-center ${i === winnerIdx ? "bg-blue-50/50" : ""}`}>
                      <div className="flex justify-center"><Stars count={car.ncapStars} /></div>
                    </td>
                  ))}
                </tr>
                <NumRow label="Airbags" values={cars.map((c) => c.airbagsCount)} unit="" winnerIdx={winnerIdx} higher />
                <NumRow label="Ground clearance" values={cars.map((c) => c.groundClearanceMM)} unit="mm" winnerIdx={winnerIdx} higher />

                {/* Comfort */}
                <SectionRow title="Comfort & Space" colCount={colCount} />
                <NumRow label="Seats" values={cars.map((c) => c.seatingCapacity)} unit="" winnerIdx={winnerIdx} higher />
                <NumRow label="Boot space" values={cars.map((c) => c.bootLitres)} unit="L" winnerIdx={winnerIdx} higher />

                {/* Ownership */}
                <SectionRow title="Ownership" colCount={colCount} />
                <NumRow label="Service/year" values={cars.map((c) => c.annualServiceCost)} unit="₹" prefix winnerIdx={winnerIdx} lower />
                <NumRow label="Insurance/year" values={cars.map((c) => c.insuranceAnnual)} unit="₹" prefix winnerIdx={winnerIdx} lower />
                <NumRow label="3yr resale" values={cars.map((c) => c.resaleValuePct3yr)} unit="%" winnerIdx={winnerIdx} higher />
                <DataRow
                  label="Waiting period"
                  values={cars.map((c) => c.waitingPeriodWeeks ? `${c.waitingPeriodWeeks} weeks` : "In stock")}
                  winnerIdx={winnerIdx}
                />

                {/* AI Verdict per category */}
                {result && result.categories.length > 0 && (
                  <>
                    <SectionRow title="AI Category Verdict" colCount={colCount} />
                    {result.categories.map((cat) => (
                      <tr key={cat.name} className="border-b border-gray-50">
                        <td className="py-3 pr-4 text-sm text-gray-500">{cat.name}</td>
                        {cars.map((car, i) => {
                          const catWinner = car.id === cat.winner;
                          return (
                            <td key={car.id} className={`py-3 px-2 text-center text-xs ${i === winnerIdx ? "bg-blue-50/50" : ""}`}>
                              {catWinner ? (
                                <span className="inline-block bg-green-100 text-green-700 font-semibold rounded-full px-2 py-0.5">Winner</span>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Buy now CTAs */}
      <div className={`grid gap-3`} style={{ gridTemplateColumns: `repeat(${colCount}, 1fr)` }}>
        {cars.map((car) => (
          <Link
            key={car.id}
            href={`/car/${car.id}`}
            className="flex flex-col items-center p-4 border border-gray-100 rounded-xl hover:shadow-sm transition-shadow text-center"
          >
            <p className="font-semibold text-brand-navy text-sm mb-1">{car.model}</p>
            <p className="text-xs text-gray-400 mb-3">{fmtLakhs(car.exShowroomPrice)}</p>
            <span className="text-xs bg-brand-navy text-white rounded-full px-4 py-1.5 font-medium hover:bg-brand-navy/90 transition-colors">
              View details →
            </span>
          </Link>
        ))}
      </div>

      {error && (
        <p className="text-xs text-center text-brand-red">AI verdict unavailable. Showing spec comparison only.</p>
      )}
    </div>
  );
}

function SectionRow({ title, colCount }: { title: string; colCount: number }) {
  return (
    <tr className="bg-gray-50">
      <td colSpan={colCount + 1} className="py-2 px-0">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{title}</p>
      </td>
    </tr>
  );
}

function DataRow({
  label, values, winnerIdx, capitalize,
}: {
  label: string;
  values: string[];
  winnerIdx: number;
  capitalize?: boolean;
}) {
  return (
    <tr className="border-b border-gray-50">
      <td className="py-2.5 pr-4 text-sm text-gray-500">{label}</td>
      {values.map((v, i) => (
        <td key={i} className={`py-2.5 px-2 text-center text-sm font-medium text-gray-800 ${i === winnerIdx ? "bg-blue-50/50" : ""} ${capitalize ? "capitalize" : ""}`}>
          {v}
        </td>
      ))}
    </tr>
  );
}

function NumRow({
  label, values, unit, prefix, winnerIdx, higher, lower,
}: {
  label: string;
  values: number[];
  unit: string;
  prefix?: boolean;
  winnerIdx: number;
  higher?: boolean;
  lower?: boolean;
}) {
  const max = Math.max(...values);
  const bestIdx = higher
    ? values.indexOf(Math.max(...values))
    : lower
    ? values.indexOf(Math.min(...values))
    : -1;

  return (
    <tr className="border-b border-gray-50">
      <td className="py-2.5 pr-4 text-sm text-gray-500">{label}</td>
      {values.map((v, i) => (
        <td key={i} className={`py-2.5 px-2 text-center ${i === winnerIdx ? "bg-blue-50/50" : ""}`}>
          <BarCell
            value={v}
            max={max}
            label={prefix ? `₹${fmt(v)}` : `${v}${unit}`}
          />
          {i === bestIdx && (
            <span className="text-[10px] text-green-600 font-medium">Best</span>
          )}
        </td>
      ))}
    </tr>
  );
}
