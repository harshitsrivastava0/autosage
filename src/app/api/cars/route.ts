import { NextRequest, NextResponse } from "next/server";
import { CARS } from "@/lib/cars/dataset";
import { getOnRoadPrice } from "@/lib/cars/onroad";
import type { Car, OnRoadBreakdown } from "@/types";

export type CarWithOnRoad = Car & { onRoadPrice: OnRoadBreakdown };

/**
 * GET /api/cars
 *
 * Query params:
 *   q          – full-text search across make, model, variant
 *   budget     – max exShowroomPrice (applies ±10% tolerance)
 *   fuel       – FuelType filter (petrol|diesel|hybrid|electric|cng)
 *   bodyType   – BodyType filter (hatchback|sedan|suv|muv|ev)
 *   seats      – minimum seatingCapacity
 *   city       – CityId for on-road price computation (default: delhi)
 *
 * Returns { cars: CarWithOnRoad[], total: number }
 * All filtering is in-memory — no DB call, target <500ms.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = req.nextUrl;

  const q = searchParams.get("q")?.toLowerCase().trim() ?? "";
  const budgetParam = searchParams.get("budget");
  const fuel = searchParams.get("fuel")?.toLowerCase() ?? "";
  const bodyType = searchParams.get("bodyType")?.toLowerCase() ?? "";
  const seatsParam = searchParams.get("seats");
  const city = searchParams.get("city") ?? "delhi";

  const budgetMax = budgetParam ? Number(budgetParam) * 1.1 : Infinity;
  const minSeats = seatsParam ? Number(seatsParam) : 0;

  const filtered = CARS.filter((car) => {
    if (q && !`${car.make} ${car.model} ${car.variant}`.toLowerCase().includes(q)) {
      return false;
    }
    if (budgetParam && car.exShowroomPrice > budgetMax) {
      return false;
    }
    if (fuel && car.fuelType !== fuel) {
      return false;
    }
    if (bodyType && car.bodyType !== bodyType) {
      return false;
    }
    if (minSeats && car.seatingCapacity < minSeats) {
      return false;
    }
    return true;
  });

  const cars: CarWithOnRoad[] = filtered.map((car) => ({
    ...car,
    onRoadPrice: getOnRoadPrice(car.exShowroomPrice, city),
  }));

  return NextResponse.json({ cars, total: cars.length });
}
