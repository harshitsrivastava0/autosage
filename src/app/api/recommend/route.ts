import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { CARS } from "@/lib/cars/dataset";
import { filterAndScore } from "@/lib/cars/filter";
import { getOnRoadPrice } from "@/lib/cars/onroad";
import { upsertSession } from "@/lib/db";
import type { AdvisorAnswers, ShortlistItem, HonourableMention, MonthlyCost } from "@/types";

const AnswersSchema = z.object({
  budgetMin: z.number().min(0),
  budgetMax: z.number().positive(),
  useCase: z.array(z.string()),
  fuelPreference: z.array(z.string()),
  transmission: z.string(),
  mustHaveFeatures: z.array(z.string()),
  seatsNeeded: z.number().int().min(2),
  prioritize: z.string(),
});

const BodySchema = z.object({
  sessionId: z.string(),
  city: z.string().default("delhi"),
  answers: AnswersSchema,
});

/** Rule-based fallback: top 3 scored cars as a minimal shortlist */
function buildFallbackShortlist(scored: ReturnType<typeof filterAndScore>, city: string): ShortlistItem[] {
  return scored.slice(0, 3).map((s, i) => {
    const onRoad = getOnRoadPrice(s.car.exShowroomPrice, city);
    const loan = onRoad.total * 0.85;
    const r = 0.085 / 12;
    const n = 60;
    const emi = Math.round((loan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));

    const fuelPrice = s.car.fuelType === "diesel" ? 90 : s.car.fuelType === "cng" ? 90 : s.car.fuelType === "electric" ? 8 : 103;
    const monthlyKm = 1200;
    let fuelMonthly: number;
    if (s.car.fuelType === "electric") {
      fuelMonthly = Math.round((monthlyKm / (s.car.realWorldMileageKmpl / 100)) * fuelPrice);
    } else {
      fuelMonthly = Math.round((monthlyKm / s.car.realWorldMileageKmpl) * fuelPrice);
    }

    const monthlyCost: MonthlyCost = {
      emiAt85Pct: emi,
      fuelMonthly,
      insuranceMonthly: Math.round(s.car.insuranceAnnual / 12),
      totalMonthly: emi + fuelMonthly + Math.round(s.car.insuranceAnnual / 12),
    };

    return {
      carId: s.car.id,
      rank: i + 1,
      matchScore: Math.round(s.score),
      headline: s.car.expertSummary.split(".")[0],
      reasons: s.car.pros,
      tradeoffs: s.car.cons,
      bestFor: s.car.targetBuyer,
      variantRecommendation: s.car.allVariants.find((v) => v.isTopSelling)?.name ?? s.car.variant,
      avoidVariant: s.car.allVariants[0]?.name ?? "base trim",
      monthlyCost,
      vsCategory: `${s.car.overallRating}/5 rated — #${i + 1} match for your criteria`,
      car: s.car,
    };
  });
}

/**
 * POST /api/recommend
 *
 * Runs the filter+score pipeline and returns rule-based ranked shortlist.
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

  const { sessionId, city, answers } = parsed.data;
  const typedAnswers = answers as AdvisorAnswers;

  // Filter and score candidates
  const scored = filterAndScore(CARS, typedAnswers);

  if (scored.length === 0) {
    return NextResponse.json(
      { error: "No cars match your criteria. Try widening your budget or removing filters." },
      { status: 404 }
    );
  }

  const shortlist = buildFallbackShortlist(scored, city);
  const honourableMentions: HonourableMention[] = scored.slice(3, 5).map((s) => ({
    carId: s.car.id,
    oneLineReason: s.car.pros[0] ?? s.car.expertSummary.split(".")[0],
    car: s.car,
  }));

  const top = scored[0].car;
  const priorityLabel: Record<string, string> = {
    safety: "safety-first",
    mileage: "fuel-economy",
    performance: "performance",
    features: "feature-packed",
    resale: "high-resale-value",
  };
  const summary = `Based on your preferences, here are your top ${shortlist.length} matches — ranked by ${priorityLabel[typedAnswers.prioritize] ?? "overall value"}. ${top.make} ${top.model} leads with a ${Math.round(scored[0].score)}% match score.`;
  const budgetInsight = shortlist[0].matchScore >= 90
    ? `Your budget is well-matched to top-spec variants in this segment.`
    : shortlist[0].matchScore >= 75
    ? `Your budget covers strong mid-spec variants. Consider stretching ₹1–2L for top trim.`
    : `Your budget is tight for this segment — base/mid variants only. Widening by ₹2L opens better options.`;
  const cityNote = `On-road prices computed for ${city.charAt(0).toUpperCase() + city.slice(1)}.`;

  // Persist to session (non-fatal)
  try {
    await upsertSession({
      id: sessionId,
      city: city as never,
      answers: typedAnswers,
      shortlist,
    });
  } catch {
    // Non-fatal
  }

  return NextResponse.json({ shortlist, honourableMentions, summary, budgetInsight, cityNote });
}
