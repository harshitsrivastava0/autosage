import type { CityId, OnRoadBreakdown } from "@/types";

/**
 * City → state road-tax rate function.
 * Returns road tax as a fraction of ex-showroom price.
 * Slab-based where applicable; flat rate otherwise.
 */
function roadTaxRate(exShowroom: number, cityId: CityId): number {
  switch (cityId) {
    case "delhi":
      // Delhi: 4% up to ₹6L, 7% ₹6–10L, 10% above ₹10L
      if (exShowroom <= 600_000) return 0.04;
      if (exShowroom <= 1_000_000) return 0.07;
      return 0.1;

    case "mumbai":
    case "pune":
      // Maharashtra: 7% up to ₹10L, 10% ₹10–20L, 13% above ₹20L
      if (exShowroom <= 1_000_000) return 0.07;
      if (exShowroom <= 2_000_000) return 0.1;
      return 0.13;

    case "bangalore":
      // Karnataka: flat 13%
      return 0.13;

    case "chennai":
      // Tamil Nadu: 10% up to ₹10L, 12% above
      return exShowroom <= 1_000_000 ? 0.1 : 0.12;

    case "hyderabad":
      // Telangana: flat 9%
      return 0.09;

    case "ahmedabad":
      // Gujarat: flat 6%
      return 0.06;

    case "kolkata":
      // West Bengal: flat 7%
      return 0.07;

    case "jaipur":
      // Rajasthan: flat 8%
      return 0.08;

    case "lucknow":
      // Uttar Pradesh: flat 8%
      return 0.08;

    default:
      // Unknown city — fall back to Delhi rates
      return roadTaxRate(exShowroom, "delhi");
  }
}

/**
 * Computes itemised on-road price for a car given its ex-showroom price and city.
 * Mirrors CarDekho's on-road price breakdown UI.
 *
 * Formula:
 *   roadTax      = exShowroom × cityRate (slab-based)
 *   insurance    = ₹25,000 + (exShowroom × 0.2%) capped at ₹40,000
 *   registration = ₹1,500 flat
 *   TCS          = 1% of exShowroom if exShowroom > ₹10L (collected at source)
 *   fastag       = ₹500 flat
 *   total        = sum of all components
 */
export function getOnRoadPrice(
  exShowroom: number,
  cityId: string
): OnRoadBreakdown {
  const city = cityId as CityId;

  const roadTax = Math.round(exShowroom * roadTaxRate(exShowroom, city));
  const insurance = Math.min(25_000 + Math.round(exShowroom * 0.002), 40_000);
  const registration = 1_500;
  // TCS applies only above ₹10 lakh (Government of India rule)
  const tcs = exShowroom > 1_000_000 ? Math.round(exShowroom * 0.01) : 0;
  const fastag = 500;

  const total = exShowroom + roadTax + insurance + registration + tcs + fastag;

  return { exShowroom, roadTax, insurance, registration, tcs, fastag, total };
}
