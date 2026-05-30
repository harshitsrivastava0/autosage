"use client";

import { useState } from "react";
import type { Car } from "@/types";

interface SpecGroup {
  title: string;
  rows: { label: string; value: string }[];
}

function buildGroups(car: Car): SpecGroup[] {
  return [
    {
      title: "Engine & Transmission",
      rows: [
        { label: "Engine displacement", value: `${car.engineCC} cc` },
        { label: "Max power", value: `${car.powerBhp} bhp` },
        { label: "Max torque", value: `${car.torqueNm} Nm` },
        { label: "Transmission", value: car.transmission.toUpperCase() },
        { label: "Drive type", value: car.driveType },
      ],
    },
    {
      title: "Fuel & Performance",
      rows: [
        { label: "Fuel type", value: car.fuelType.charAt(0).toUpperCase() + car.fuelType.slice(1) },
        { label: "ARAI mileage", value: `${car.mileageKmpl} km/l` },
        { label: "Real-world mileage", value: `${car.realWorldMileageKmpl} km/l` },
        { label: "Fuel tank capacity", value: `${car.fuelTankLitres} litres` },
      ],
    },
    {
      title: "Suspension & Brakes",
      rows: [
        { label: "Front suspension", value: "McPherson strut" },
        { label: "Rear suspension", value: "Twist beam / multi-link" },
        { label: "Front brakes", value: "Ventilated disc" },
        { label: "Rear brakes", value: "Drum / disc" },
      ],
    },
    {
      title: "Dimensions & Capacity",
      rows: [
        { label: "Seating capacity", value: `${car.seatingCapacity}` },
        { label: "Boot space", value: `${car.bootLitres} litres` },
        { label: "Ground clearance", value: `${car.groundClearanceMM} mm` },
      ],
    },
    {
      title: "Safety",
      rows: [
        { label: "Global NCAP", value: `${car.ncapStars} / 5 stars` },
        { label: "Airbags", value: `${car.airbagsCount}` },
        ...car.safetyFeatures.map((f) => ({ label: f, value: "Standard" })),
      ],
    },
    {
      title: "Comfort & Convenience",
      rows: car.keyFeatures.slice(0, 5).map((f) => ({ label: f, value: "Standard" })),
    },
    {
      title: "Interior",
      rows: car.keyFeatures.slice(5, 9).map((f) => ({ label: f, value: "Standard" })),
    },
    {
      title: "Exterior",
      rows: [
        { label: "Body type", value: car.bodyType.charAt(0).toUpperCase() + car.bodyType.slice(1) },
        { label: "Available colours", value: `${car.availableColors.length}` },
        { label: "Wheel type", value: "Alloy" },
      ],
    },
    {
      title: "Entertainment & Communication",
      rows: car.keyFeatures
        .filter((f) => /touchscreen|infotainment|speakers|android|apple/i.test(f))
        .map((f) => ({ label: f, value: "Standard" }))
        .concat([{ label: "Bluetooth", value: "Standard" }, { label: "USB", value: "Standard" }]),
    },
    {
      title: "ADAS Features",
      rows: car.safetyFeatures
        .filter((f) => /adas|lane|adaptive|blind|rear cross/i.test(f))
        .map((f) => ({ label: f, value: "Available" }))
        .concat(
          car.keyFeatures
            .filter((f) => /adas|lane|adaptive/i.test(f))
            .map((f) => ({ label: f, value: "Available" }))
        ),
    },
    {
      title: "Advanced Internet Features",
      rows: car.keyFeatures
        .filter((f) => /connected|remote|telematics|over.the.air|ota/i.test(f))
        .map((f) => ({ label: f, value: "Available" }))
        .concat([{ label: "OTA updates", value: "Available on select variants" }]),
    },
  ].filter((g) => g.rows.length > 0);
}

interface SpecsTableProps {
  car: Car;
}

export function SpecsTable({ car }: SpecsTableProps) {
  const groups = buildGroups(car);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggle = (title: string) => {
    setCollapsed((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <div className="space-y-3">
      {groups.map((group) => {
        const isCollapsed = collapsed[group.title];
        return (
          <div key={group.title} className="border border-gray-100 rounded-xl overflow-hidden">
            <button
              onClick={() => toggle(group.title)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <span className="font-semibold text-sm text-brand-navy">{group.title}</span>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${isCollapsed ? "" : "rotate-180"}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {!isCollapsed && (
              <div className="divide-y divide-gray-50">
                {group.rows.map((row) => (
                  <div key={row.label} className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-sm text-gray-500">{row.label}</span>
                    <span className="text-sm font-medium text-gray-800">{row.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
