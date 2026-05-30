import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { Car } from "@/types";

const BodySchema = z.object({
  sessionId: z.string(),
  message: z.string().min(1).max(2000),
  shortlist: z.array(z.record(z.string(), z.unknown())).optional().default([]),
  city: z.string().default("delhi"),
});

function generateResponse(message: string, shortlist: Record<string, unknown>[], city: string): string {
  const msg = message.toLowerCase();
  const carNames = shortlist
    .map((s) => {
      const car = s.car as Car | undefined;
      return car ? `${car.make} ${car.model}` : null;
    })
    .filter(Boolean) as string[];
  const topCar = carNames[0];

  if (/emi|loan|finance|monthly|cost|afford/.test(msg)) {
    const item = shortlist[0];
    const mc = item?.monthlyCost as Record<string, number> | undefined;
    if (mc && topCar) {
      return `For the ${topCar}, you're looking at approximately ₹${mc.emiAt85Pct?.toLocaleString("en-IN")} EMI/month (85% loan at 8.5% for 5 years), plus ₹${mc.fuelMonthly?.toLocaleString("en-IN")} fuel and ₹${mc.insuranceMonthly?.toLocaleString("en-IN")} insurance — totalling around ₹${mc.totalMonthly?.toLocaleString("en-IN")}/month. I recommend getting quotes from HDFC Bank, SBI, and Maruti Finance for competitive rates.`;
    }
    return "To calculate your EMI accurately, share your budget and preferred tenure. Most banks offer 7–9% interest for new cars with 80–90% financing.";
  }

  if (/insur|coverage|premium/.test(msg)) {
    const car = shortlist[0]?.car as Car | undefined;
    if (car) {
      return `For the ${car.make} ${car.model}, expect first-year comprehensive insurance around ₹${car.insuranceAnnual?.toLocaleString("en-IN")}. Compare quotes from HDFC Ergo, Bajaj Allianz, and TATA AIG — online quotes are typically 15–20% cheaper than dealer-offered policies.`;
    }
    return "First-year comprehensive insurance typically runs 2.5–3.5% of ex-showroom price for new cars. Compare quotes from HDFC Ergo and Bajaj Allianz for best rates.";
  }

  if (/mileage|fuel|efficiency|kmpl|range/.test(msg)) {
    const results = shortlist.slice(0, 3).map((s) => {
      const car = s.car as Car | undefined;
      return car ? `${car.make} ${car.model}: ${car.realWorldMileageKmpl} km/l real-world` : null;
    }).filter(Boolean);
    if (results.length) {
      return `Real-world mileage comparison:\n${results.join("\n")}\n\nNote: Real-world figures are 15–20% below ARAI ratings. Drive in Eco mode and maintain tyre pressure at recommended PSI for best results.`;
    }
    return "Real-world mileage is typically 15–20% below ARAI ratings. Petrol cars average 16–22 km/l in city, diesel 18–25 km/l. EV range reduces 20–30% with AC on.";
  }

  if (/safe|ncap|airbag|crash/.test(msg)) {
    const results = shortlist.slice(0, 3).map((s) => {
      const car = s.car as Car | undefined;
      return car ? `${car.make} ${car.model}: ${car.ncapStars > 0 ? `${car.ncapStars}-star NCAP, ${car.airbagsCount} airbags` : `${car.airbagsCount} airbags (no NCAP rating)`}` : null;
    }).filter(Boolean);
    if (results.length) {
      return `Safety comparison from your shortlist:\n${results.join("\n")}\n\nGlobal NCAP testing is the most rigorous independent safety assessment. A 4+ star rating provides strong real-world occupant protection.`;
    }
    return "Look for Global NCAP ratings — 4+ stars provide strong protection. Always check airbag count: minimum 6 airbags recommended for family cars.";
  }

  if (/resale|value|depreci/.test(msg)) {
    const results = shortlist.slice(0, 3).map((s) => {
      const car = s.car as Car | undefined;
      return car ? `${car.make} ${car.model}: retains ${car.resaleValuePct3yr}% after 3 years` : null;
    }).filter(Boolean);
    if (results.length) {
      return `Resale value comparison:\n${results.join("\n")}\n\nMaruti Suzuki generally holds the best resale value in India, followed by Hyundai and Toyota. Service history and low mileage are the biggest factors affecting resale.`;
    }
    return "Maruti holds the best resale in India (75–82% after 3 years), followed by Hyundai and Toyota. EVs currently have lower resale due to battery concerns but this is improving.";
  }

  if (/service|maintain|repair/.test(msg)) {
    const car = shortlist[0]?.car as Car | undefined;
    if (car) {
      return `Annual service cost for the ${car.make} ${car.model} is approximately ₹${car.annualServiceCost?.toLocaleString("en-IN")}/year. ${car.make === "Maruti Suzuki" ? "Maruti has India's widest service network with 4000+ service centres." : `Always get at least 2 quotes for non-warranty repairs.`}`;
    }
    return "Annual service costs vary: budget cars ₹6,000–9,000/year; mid-segment ₹10,000–15,000; premium ₹18,000–28,000. Maruti has the lowest service costs due to widest network.";
  }

  if (/compare|vs|better|difference/.test(msg)) {
    if (carNames.length >= 2) {
      return `To compare ${carNames.join(" vs ")} in detail, visit the Compare page — it shows head-to-head specs across 8 categories including mileage, safety, features, and running costs. I can also answer specific questions about any dimension you care about most.`;
    }
    return "Use the Compare page to see head-to-head specs. Tell me which specific aspect you want to compare — mileage, safety, features, or running costs — and I'll give you a focused answer.";
  }

  if (/wait|delivery|available|stock/.test(msg)) {
    const results = shortlist.slice(0, 3).map((s) => {
      const car = s.car as Car | undefined;
      if (!car) return null;
      return car.waitingPeriodWeeks
        ? `${car.make} ${car.model}: ~${car.waitingPeriodWeeks} weeks`
        : `${car.make} ${car.model}: ready stock, no significant wait`;
    }).filter(Boolean);
    if (results.length) {
      return `Current delivery timelines:\n${results.join("\n")}\n\nTimelines vary by variant and colour. Booking a popular colour like white or silver typically means faster delivery.`;
    }
    return "Delivery timelines depend on variant and colour. Popular combinations can wait 4–12 weeks. Visit your nearest dealer for current stock availability.";
  }

  if (/color|colour/.test(msg)) {
    const car = shortlist[0]?.car as Car | undefined;
    if (car && car.availableColors?.length) {
      return `The ${car.make} ${car.model} is available in: ${car.availableColors.join(", ")}. White and silver shades typically have the shortest waiting period and best resale value.`;
    }
    return "White and silver are the most popular colours in India, offering faster delivery and better resale value. Dual-tone options are eye-catching but may have longer waiting periods.";
  }

  if (/recommend|suggest|which|best|choose/.test(msg)) {
    if (topCar) {
      const car = shortlist[0]?.car as Car | undefined;
      return `Based on your criteria, the ${topCar} is your top match${car ? ` at ${car.overallRating}/5 stars with ${car.reviewCount?.toLocaleString("en-IN")} reviews` : ""}. ${car ? car.expertSummary : ""} If you want me to elaborate on any specific aspect, just ask!`;
    }
    return "Based on your requirements, I recommend starting with your highest-scored car. Consider the match score, your primary use case, and budget fit before making the final decision.";
  }

  // Default helpful response
  if (topCar) {
    return `Happy to help with questions about your shortlist! I can compare ${carNames.join(", ")} on mileage, safety, EMI, insurance, resale value, service costs, or delivery timelines. What would you like to know?`;
  }
  return "I'm here to help you make the right car decision! Ask me about EMI calculations, insurance costs, mileage comparison, safety ratings, resale value, service costs, or delivery timelines for any car in your shortlist.";
}

/**
 * POST /api/chat
 *
 * Returns a rule-based response as Server-Sent Events (text/event-stream).
 */
export async function POST(req: NextRequest): Promise<NextResponse | Response> {
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

  const { message, shortlist, city } = parsed.data;
  const responseText = generateResponse(message, shortlist, city);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      // Stream word by word for a natural feel
      const words = responseText.split(" ");
      for (let i = 0; i < words.length; i++) {
        const chunk = (i === 0 ? "" : " ") + words[i];
        controller.enqueue(encoder.encode(`data: ${chunk}\n\n`));
        // Small delay for streaming effect
        await new Promise((resolve) => setTimeout(resolve, 20));
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
