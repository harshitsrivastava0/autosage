import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCarById } from "@/lib/cars/dataset";
import { getOnRoadPrice } from "@/lib/cars/onroad";
import type { Car, ComparisonCategory, ComparisonResult } from "@/types";

const BodySchema = z.object({
  carIds: z.array(z.string()).min(2).max(4),
  city: z.string().default("delhi"),
  sessionId: z.string().optional(),
});

function scoreCategory(
  cars: Car[],
  name: string,
  getValue: (c: Car) => number,
  higherIsBetter = true
): ComparisonCategory {
  const scores: Record<string, number> = {};
  const values = cars.map((c) => getValue(c));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;

  cars.forEach((c) => {
    const v = getValue(c);
    const normalised = range === 0 ? 75 : higherIsBetter
      ? 60 + Math.round(((v - min) / range) * 35)
      : 60 + Math.round(((max - v) / range) * 35);
    scores[c.id] = normalised;
  });

  const sorted = [...cars].sort((a, b) =>
    higherIsBetter ? getValue(b) - getValue(a) : getValue(a) - getValue(b)
  );
  const winner = sorted[0];
  const runnerUp = sorted[1];
  const diff = Math.abs(getValue(winner) - getValue(runnerUp));
  const margin: ComparisonCategory["margin"] =
    range === 0 ? "close" : diff / (max || 1) < 0.08 ? "close" : diff / (max || 1) < 0.2 ? "clear" : "dominant";

  return { name, winner: winner.id, margin, explanation: "", scores };
}

function buildVerdict(cars: Car[], city: string, categories: ComparisonCategory[]): ComparisonResult {
  const wins: Record<string, number> = {};
  cars.forEach((c) => { wins[c.id] = 0; });
  categories.forEach((cat) => { wins[cat.winner] = (wins[cat.winner] ?? 0) + 1; });

  const sortedByWins = [...cars].sort((a, b) => (wins[b.id] ?? 0) - (wins[a.id] ?? 0));
  const overallWinner = sortedByWins[0];
  const winnerWins = wins[overallWinner.id] ?? 0;
  const isDecisive = winnerWins >= Math.ceil(categories.length * 0.6);

  const winnerName = `${overallWinner.make} ${overallWinner.model}`;
  const verdict = isDecisive
    ? `${winnerName} wins this comparison — leading in ${winnerWins} of ${categories.length} categories. ${overallWinner.expertSummary.split(".")[0]}.`
    : `This is a close call. ${winnerName} edges ahead by wins, but the right choice depends on your priorities. See category breakdown below.`;

  const whoShouldBuy: Record<string, string> = {};
  cars.forEach((car) => {
    const topPro = car.pros[0] ?? car.expertSummary.split(".")[0];
    whoShouldBuy[car.id] = `Buy the ${car.make} ${car.model} if ${topPro.toLowerCase().replace(/^best-in-class /, "you want ").replace(/^segment-best /, "you want ").replace(/^india's /, "you want ").replace(/^top-spec /i, "you want ")}`;
  });

  const onRoads = cars.map((c) => ({
    car: c,
    onRoad: getOnRoadPrice(c.exShowroomPrice, city).total,
  })).sort((a, b) => a.onRoad - b.onRoad);

  const cheapest = onRoads[0];
  const mostExp = onRoads[onRoads.length - 1];
  const diff = mostExp.onRoad - cheapest.onRoad;
  const priceVerdictNote = diff === 0
    ? "All cars are similarly priced on-road."
    : `${cheapest.car.make} ${cheapest.car.model} is ₹${(diff / 100000).toFixed(1)}L cheaper on-road than ${mostExp.car.make} ${mostExp.car.model} in ${city.charAt(0).toUpperCase() + city.slice(1)}.`;

  return {
    verdict,
    winnerCarId: isDecisive ? overallWinner.id : null,
    categories,
    whoShouldBuy,
    priceVerdictNote,
  };
}

/**
 * POST /api/compare
 *
 * Accepts 2–4 car IDs, produces rule-based structured comparison verdict.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { carIds, city } = parsed.data;
  const cars = carIds.map((id) => getCarById(id)).filter(Boolean) as Car[];
  if (cars.length < 2) {
    return NextResponse.json({ error: "At least 2 valid car IDs required" }, { status: 400 });
  }

  const categories: ComparisonCategory[] = [
    scoreCategory(cars, "Mileage", (c) => c.realWorldMileageKmpl),
    scoreCategory(cars, "Safety", (c) => c.ncapStars * 10 + c.airbagsCount),
    scoreCategory(cars, "Performance", (c) => c.powerBhp),
    scoreCategory(cars, "Features", (c) => c.keyFeatures.length),
    scoreCategory(cars, "Comfort & Space", (c) => c.bootLitres + c.seatingCapacity * 10),
    scoreCategory(cars, "Resale Value", (c) => c.resaleValuePct3yr),
    scoreCategory(cars, "Running Cost", (c) => c.annualServiceCost + c.insuranceAnnual, false),
    scoreCategory(cars, "Value for Money", (c) => c.overallRating * 20 - c.exShowroomPrice / 100000),
  ];

  // Add explanations
  const explainers: Record<string, (winner: Car, cars: Car[]) => string> = {
    "Mileage": (w) => `${w.make} ${w.model} delivers ${w.realWorldMileageKmpl} km/l real-world — lowest running cost per kilometre.`,
    "Safety": (w) => `${w.make} ${w.model} leads with ${w.ncapStars}-star NCAP and ${w.airbagsCount} airbags.`,
    "Performance": (w) => `${w.make} ${w.model} peaks at ${w.powerBhp} bhp — most responsive in this group.`,
    "Features": (w) => `${w.make} ${w.model} packs ${w.keyFeatures.length} key features including ${w.keyFeatures.slice(0, 2).join(", ")}.`,
    "Comfort & Space": (w) => `${w.make} ${w.model} offers ${w.bootLitres}L boot and ${w.seatingCapacity} seats — most practical here.`,
    "Resale Value": (w) => `${w.make} ${w.model} retains ${w.resaleValuePct3yr}% of value after 3 years — best long-term investment.`,
    "Running Cost": (w) => `${w.make} ${w.model} costs least to maintain — ₹${((w.annualServiceCost + w.insuranceAnnual) / 1000).toFixed(0)}k/yr service + insurance.`,
    "Value for Money": (w) => `${w.make} ${w.model} offers the strongest spec-to-price ratio at this price point.`,
  };

  categories.forEach((cat) => {
    const winner = cars.find((c) => c.id === cat.winner);
    if (winner && explainers[cat.name]) {
      cat.explanation = explainers[cat.name](winner, cars);
    }
  });

  const result = buildVerdict(cars, city, categories);
  return NextResponse.json(result);
}
