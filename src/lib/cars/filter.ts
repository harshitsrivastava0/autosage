import type { AdvisorAnswers, Car, ScoredCar } from "@/types";

/** Feature keywords mapped to Car fields for mustHaveFeature matching */
const FEATURE_MATCHERS: Record<string, (car: Car) => boolean> = {
  sunroof: (c) =>
    c.keyFeatures.some((f) => /sunroof|panoramic/i.test(f)),
  adas: (c) =>
    c.keyFeatures.some((f) => /adas|adaptive cruise|lane/i.test(f)),
  "360 camera": (c) =>
    c.keyFeatures.some((f) => /360|surround/i.test(f)),
  "ventilated seats": (c) =>
    c.keyFeatures.some((f) => /ventilated/i.test(f)),
  "wireless carplay": (c) =>
    c.keyFeatures.some((f) => /wireless.*carplay|carplay.*wireless/i.test(f)),
  "7 airbags": (c) => c.airbagsCount >= 7,
  "awd/4wd": (c) => c.driveType === "AWD" || c.driveType === "4WD",
  "fast charging": (c) =>
    c.keyFeatures.some((f) => /fast charg|dc charg/i.test(f)),
};

/**
 * Compute priority-weighted score for a car.
 * Each prioritize option maps to the most relevant car spec.
 * Higher score = better match for the given priority.
 */
function computeScore(car: Car, answers: AdvisorAnswers): number {
  let score = 0;

  switch (answers.prioritize) {
    case "safety":
      score += car.ncapStars * 20;
      score += Math.min(car.airbagsCount, 6) * 2;
      break;
    case "mileage":
      score += car.mileageKmpl * 15;
      break;
    case "performance":
      score += car.powerBhp * 10;
      score += car.torqueNm * 0.5;
      break;
    case "features":
      score += car.keyFeatures.length * 5;
      break;
    case "resale":
      score += car.resaleValuePct3yr * 12;
      break;
  }

  // Boost for each must-have feature that the car has
  for (const feature of answers.mustHaveFeatures) {
    const matcher = FEATURE_MATCHERS[feature.toLowerCase()];
    if (matcher?.(car)) {
      score += 5;
    }
  }

  // Small boost for overall user rating (tie-breaker)
  score += car.overallRating * 2;

  return score;
}

/**
 * Filters 50-car dataset against wizard answers, then scores and ranks results.
 *
 * Hard filters (disqualify if failed):
 *   - Budget: exShowroomPrice within [budgetMin × 0.9, budgetMax × 1.1]
 *   - Fuel: matches any in fuelPreference (skipped if preference includes "any")
 *   - Seats: seatingCapacity >= seatsNeeded
 *   - Transmission: matches (skipped if "any")
 *
 * Soft scoring uses the prioritize field + mustHaveFeatures.
 * Returns top 8 by score (AI receives all 8; front-end shows top 3 + 2 mentions).
 */
export function filterAndScore(
  cars: Car[],
  answers: AdvisorAnswers
): ScoredCar[] {
  const budgetMin = answers.budgetMin * 0.9;
  const budgetMax = answers.budgetMax * 1.1;

  const anyFuel =
    answers.fuelPreference.length === 0 ||
    answers.fuelPreference.includes("any" as never);

  const anyTransmission = answers.transmission === "any";

  const filtered = cars.filter((car) => {
    // Budget filter
    if (
      car.exShowroomPrice < budgetMin ||
      car.exShowroomPrice > budgetMax
    ) {
      return false;
    }

    // Fuel filter
    if (!anyFuel && !answers.fuelPreference.includes(car.fuelType)) {
      return false;
    }

    // Seats filter
    if (car.seatingCapacity < answers.seatsNeeded) {
      return false;
    }

    // Transmission filter
    if (!anyTransmission && car.transmission !== answers.transmission) {
      return false;
    }

    return true;
  });

  const scored: ScoredCar[] = filtered.map((car) => ({
    car,
    score: computeScore(car, answers),
  }));

  // Sort descending by score, return top 8 candidates
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 8);
}
