"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import type { Car } from "@/types";
import { useCity } from "@/hooks/useCity";
import { useCompare } from "@/hooks/useCompare";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { CitySelector } from "@/components/ui/CitySelector";
import { ChatDrawer } from "@/components/chat/ChatDrawer";
import { SpecsTable } from "./SpecsTable";
import { ReviewsSection } from "./ReviewsSection";
import { ColourPicker } from "./ColourPicker";
import { EMICalculator } from "./EMICalculator";
import { getOnRoadPrice } from "@/lib/cars/onroad";

const TABS = ["Overview", "Price", "Compare", "Images", "Specs", "Reviews", "Variants", "Colours", "EMI"] as const;
type TabId = typeof TABS[number];

function fmtLakhs(n: number) {
  return `₹${(n / 100000).toFixed(2)}L`;
}

function fmtKmpl(n: number) {
  return `${n} km/l`;
}

interface CarDetailTabsProps {
  car: Car;
}

export function CarDetailTabs({ car }: CarDetailTabsProps) {
  const [active, setActive] = useState<TabId>("Overview");
  const { city } = useCity();
  const { selectedIds, addCar, removeCar, canAdd } = useCompare();
  const tabBarRef = useRef<HTMLDivElement>(null);

  const onRoad = getOnRoadPrice(car.exShowroomPrice, city as Parameters<typeof getOnRoadPrice>[1]);

  return (
    <div>
      {/* Hero header */}
      <div className="bg-brand-navy text-white">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <p className="text-white/50 text-sm mb-1">{car.make}</p>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{car.model}</h1>
              <p className="text-white/60 text-sm mt-1">{car.variant} · {car.year}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-amber-400">★</span>
                <span className="font-semibold">{car.overallRating}</span>
                <span className="text-white/50 text-sm">({car.reviewCount.toLocaleString("en-IN")} reviews)</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <PriceDisplay exShowroom={car.exShowroomPrice} city={city} showToggle />
              <p className="text-xs text-white/50 mt-1">ex-showroom</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky tab bar */}
      <div
        ref={tabBarRef}
        className="sticky top-14 z-30 bg-white border-b border-gray-200 overflow-x-auto scrollbar-hide"
      >
        <div className="max-w-5xl mx-auto px-4 flex gap-0 min-w-max">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActive(tab)}
              className={`px-4 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                active === tab
                  ? "border-brand-navy text-brand-navy"
                  : "border-transparent text-gray-500 hover:text-brand-navy"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* ── Overview ── */}
        {active === "Overview" && (
          <div className="space-y-8">
            {/* Hero image */}
            <div className="relative h-64 md:h-80 bg-gray-50 rounded-2xl overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={car.imageUrl}
                alt={`${car.make} ${car.model}`}
                className="w-full h-full object-contain p-4"
                onError={(e) => { (e.target as HTMLImageElement).src = `/cars/${car.bodyType}-placeholder.svg`; }}
              />
            </div>

            {/* Key specs grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { label: "Engine", value: `${car.engineCC}cc` },
                { label: "Power", value: `${car.powerBhp} bhp` },
                { label: "Mileage (ARAI)", value: fmtKmpl(car.mileageKmpl) },
                { label: "Ground clearance", value: `${car.groundClearanceMM} mm` },
                { label: "Seats", value: `${car.seatingCapacity}` },
                { label: "Drive type", value: car.driveType },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-400 mb-1">{label}</p>
                  <p className="font-bold text-brand-navy">{value}</p>
                </div>
              ))}
            </div>

            {/* Expert summary */}
            <div className="bg-brand-navy/5 rounded-xl p-5 border border-brand-navy/10">
              <p className="text-xs text-brand-navy font-semibold mb-2 uppercase tracking-wide">AutoSage Expert Verdict</p>
              <p className="text-sm text-gray-700 leading-relaxed">{car.expertSummary}</p>
            </div>

            {/* Pros & cons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-700 text-sm mb-3 flex items-center gap-2">
                  <span className="text-green-500">✓</span> What owners love
                </h3>
                <ul className="space-y-2">
                  {car.pros.map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-green-500 shrink-0 mt-0.5">•</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 text-sm mb-3 flex items-center gap-2">
                  <span className="text-amber-400">⚠</span> Worth knowing
                </h3>
                <ul className="space-y-2">
                  {car.cons.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-amber-400 shrink-0 mt-0.5">•</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Key features */}
            {car.keyFeatures.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-700 text-sm mb-3">Key features</h3>
                <div className="flex flex-wrap gap-2">
                  {car.keyFeatures.map((f) => (
                    <span key={f} className="text-xs bg-brand-navy/5 border border-brand-navy/10 text-brand-navy rounded-full px-3 py-1">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Price ── */}
        {active === "Price" && (
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Select city for on-road price</p>
              <CitySelector variant="dropdown" />
            </div>

            {/* Variant table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 pr-4 text-xs font-semibold text-gray-500 uppercase">Variant</th>
                    <th className="text-center py-3 px-2 text-xs font-semibold text-gray-500 uppercase">Fuel</th>
                    <th className="text-center py-3 px-2 text-xs font-semibold text-gray-500 uppercase">Trans.</th>
                    <th className="text-right py-3 px-2 text-xs font-semibold text-gray-500 uppercase">Ex-showroom</th>
                    <th className="text-right py-3 pl-4 text-xs font-semibold text-gray-500 uppercase">On-road</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {car.allVariants.map((v, i) => {
                    const or = getOnRoadPrice(v.exShowroomPrice, city as Parameters<typeof getOnRoadPrice>[1]);
                    return (
                      <tr key={i} className={`${v.isTopSelling ? "bg-amber-50" : ""}`}>
                        <td className="py-3 pr-4">
                          <p className="font-medium text-gray-800">{v.name}</p>
                          {v.isTopSelling && (
                            <span className="text-[10px] bg-amber-100 text-amber-700 font-semibold rounded px-1.5 py-0.5">Top Selling</span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-center text-gray-600 capitalize">{v.fuelType}</td>
                        <td className="py-3 px-2 text-center text-gray-600 uppercase text-xs">{v.transmission}</td>
                        <td className="py-3 px-2 text-right font-medium text-gray-800">{fmtLakhs(v.exShowroomPrice)}</td>
                        <td className="py-3 pl-4 text-right font-semibold text-brand-navy">{fmtLakhs(or.total)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Inline EMI */}
            <div className="border border-gray-100 rounded-xl p-4">
              <h3 className="font-semibold text-gray-700 text-sm mb-4">Quick EMI estimate</h3>
              <EMICalculator exShowroomPrice={car.exShowroomPrice} />
            </div>
          </div>
        )}

        {/* ── Compare ── */}
        {active === "Compare" && (
          <div className="text-center py-12 space-y-4">
            <p className="text-2xl">🔄</p>
            <h3 className="font-semibold text-brand-navy">Compare with another car</h3>
            <p className="text-sm text-gray-500">Select up to 3 other cars to compare side-by-side.</p>
            <Link
              href={`/compare?cars=${car.id}`}
              className="inline-flex items-center gap-2 bg-brand-navy text-white font-medium px-6 py-3 rounded-full hover:bg-brand-navy/90 transition-colors"
            >
              Open comparison →
            </Link>
          </div>
        )}

        {/* ── Images ── */}
        {active === "Images" && (
          <div className="space-y-4">
            <div className="relative h-72 bg-gray-50 rounded-2xl overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={car.imageUrl}
                alt={`${car.make} ${car.model}`}
                className="w-full h-full object-contain p-4"
                onError={(e) => { (e.target as HTMLImageElement).src = `/cars/${car.bodyType}-placeholder.svg`; }}
              />
            </div>
            {car.galleryUrls.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {car.galleryUrls.map((url, i) => (
                  <GalleryImage key={i} url={url} alt={`${car.make} ${car.model} angle ${i + 2}`} bodyType={car.bodyType} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center">Showing available images. More gallery angles coming soon.</p>
            )}
          </div>
        )}

        {/* ── Specs ── */}
        {active === "Specs" && <SpecsTable car={car} />}

        {/* ── Reviews ── */}
        {active === "Reviews" && <ReviewsSection car={car} />}

        {/* ── Variants ── */}
        {active === "Variants" && (
          <div className="space-y-3">
            {car.allVariants.map((v, i) => {
              const isInCompare = selectedIds.includes(car.id);
              return (
                <div key={i} className="flex items-center justify-between border border-gray-100 rounded-xl p-4">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{v.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{v.fuelType} · {v.transmission} · {v.mileageKmpl} km/l</p>
                    {v.isTopSelling && (
                      <span className="text-[10px] bg-amber-100 text-amber-700 font-semibold rounded px-1.5 py-0.5 mt-1 inline-block">Top Selling</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <p className="font-semibold text-brand-navy text-sm">{fmtLakhs(v.exShowroomPrice)}</p>
                    <button
                      onClick={() => (isInCompare ? removeCar(car.id) : addCar(car.id))}
                      disabled={!isInCompare && !canAdd}
                      className={`text-xs rounded-lg px-3 py-1.5 transition-colors ${
                        isInCompare ? "bg-brand-navy text-white" : canAdd ? "bg-gray-100 text-gray-700 hover:bg-gray-200" : "bg-gray-100 text-gray-300 cursor-not-allowed"
                      }`}
                    >
                      {isInCompare ? "✓ Added" : "Compare"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Colours ── */}
        {active === "Colours" && (
          <ColourPicker colours={car.availableColors} />
        )}

        {/* ── EMI ── */}
        {active === "EMI" && (
          <EMICalculator exShowroomPrice={car.exShowroomPrice} />
        )}
      </div>

      {/* Chat drawer */}
      <ChatDrawer
        context="detail"
        carName={`${car.make} ${car.model}`}
        popularComparison={car.popularComparisons[0]}
      />
    </div>
  );
}

// Local helper to handle gallery image 404s
function GalleryImage({ url, alt, bodyType }: { url: string; alt: string; bodyType: Car["bodyType"] }) {
  return (
    <div className="h-40 bg-gray-50 rounded-xl overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={alt}
        className="w-full h-full object-contain p-2"
        onError={(e) => {
          const parent = (e.target as HTMLElement).parentElement;
          if (parent) parent.style.display = "none";
        }}
      />
    </div>
  );
}
