// ─── Primitive enums ────────────────────────────────────────────────────────

export type BodyType = "hatchback" | "sedan" | "suv" | "muv" | "ev";

export type FuelType = "petrol" | "diesel" | "hybrid" | "electric" | "cng";

/** All gearbox variants seen in Indian market */
export type TransmissionType =
  | "manual"
  | "automatic"
  | "amt"
  | "cvt"
  | "dct"
  | "imt";

export type DriveType = "FWD" | "RWD" | "AWD" | "4WD";

export type Segment = "budget" | "mid" | "premium";

export type CityId =
  | "delhi"
  | "mumbai"
  | "bangalore"
  | "chennai"
  | "hyderabad"
  | "pune"
  | "ahmedabad"
  | "kolkata"
  | "jaipur"
  | "lucknow";

export type PriorityType =
  | "safety"
  | "performance"
  | "mileage"
  | "features"
  | "resale";

export type UseCase =
  | "city_commute"
  | "family_weekends"
  | "highway"
  | "offroad"
  | "mixed";

// ─── Car data model ──────────────────────────────────────────────────────────

/** Mirrors CarDekho's 7 user-review sentiment dimensions */
export interface SentimentScores {
  mileage: number; // 0–5
  performance: number;
  looks: number;
  comfort: number;
  engine: number;
  interior: number;
  power: number;
}

/** One row in the variants table (mirrors CarDekho's Creta variant table) */
export interface Variant {
  name: string;
  exShowroomPrice: number; // in rupees
  fuelType: FuelType;
  transmission: TransmissionType;
  mileageKmpl: number;
  isTopSelling?: boolean;
}

/**
 * Full car record — mirrors CarDekho's data model closely.
 * Prices are always in rupees (not lakhs) for arithmetic correctness;
 * formatting to "₹X.XXL" is done at the display layer.
 */
export interface Car {
  // Identity
  id: string;
  make: string;
  model: string;
  /** Representative variant shown by default */
  variant: string;
  allVariants: Variant[];
  year: number;
  bodyType: BodyType;

  // Pricing
  exShowroomPrice: number; // rupees — base/representative variant
  onRoadPriceDelhi: number; // computed ex-showroom + Delhi taxes/insurance
  priceRange: { min: number; max: number }; // across all variants

  // Core specs
  engineCC: number;
  powerBhp: number;
  torqueNm: number;
  fuelType: FuelType;
  transmission: TransmissionType;
  mileageKmpl: number; // ARAI certified
  groundClearanceMM: number;
  seatingCapacity: number;
  bootLitres: number;
  driveType: DriveType;

  // Safety
  ncapStars: number; // Global NCAP, 0–5
  airbagsCount: number;
  safetyFeatures: string[]; // e.g. ["ESP", "ABS", "ISOFIX", "TPMS"]

  // Key features (mirrors CarDekho "Key Features" section)
  keyFeatures: string[];

  // Images — stimg.cardekho.com CDN for verified cars; SVG path for rest
  imageUrl: string;
  /** Up to 3 derived gallery angles from CDN; empty for SVG cars */
  galleryUrls: string[];
  availableColors: string[];

  // Review data (mirrors CarDekho's 7 sentiment categories)
  overallRating: number; // e.g. 4.6
  reviewCount: number;
  sentimentScores: SentimentScores;
  expertSummary: string; // 1–2 sentence verdict

  // Ownership intelligence
  annualServiceCost: number; // rupees/year
  insuranceAnnual: number; // first-year estimate
  resaleValuePct3yr: number; // % of ex-showroom after 3 years
  fuelTankLitres: number;
  realWorldMileageKmpl: number; // typically 15–20% below ARAI

  // AutoSage-specific fields
  pros: string[]; // 3 data-backed pros
  cons: string[]; // 2 honest cons
  targetBuyer: string;
  bestFor: UseCase[];
  segment: Segment;
  popularComparisons: string[]; // car IDs commonly compared with this one
  /** Delivery wait; null means no significant wait */
  waitingPeriodWeeks: number | null;
}

// ─── On-road price ───────────────────────────────────────────────────────────

/** Itemised on-road price breakdown for a given city */
export interface OnRoadBreakdown {
  exShowroom: number;
  roadTax: number;
  insurance: number;
  registration: number;
  tcs: number; // Tax Collected at Source — 1% if ex-showroom > ₹10L
  fastag: number;
  total: number;
}

// ─── Advisor flow ────────────────────────────────────────────────────────────

/** Questionnaire answers collected from the 4-step wizard */
export interface AdvisorAnswers {
  budgetMin: number; // rupees
  budgetMax: number; // rupees
  useCase: UseCase[];
  fuelPreference: (FuelType | "any")[];
  transmission: TransmissionType | "any";
  mustHaveFeatures: string[];
  seatsNeeded: number;
  prioritize: PriorityType;
}

/** Monthly cost breakdown shown on each result card */
export interface MonthlyCost {
  /** EMI at 85% of ex-showroom, 8.5% pa, 5-year tenure */
  emiAt85Pct: number;
  /** Fuel cost at 1200 km/month using real-world mileage */
  fuelMonthly: number;
  insuranceMonthly: number;
  totalMonthly: number;
}

/** One item in the AI-generated shortlist */
export interface ShortlistItem {
  carId: string;
  rank: number;
  matchScore: number; // 0–100
  headline: string;
  reasons: string[]; // exactly 3
  tradeoffs: string[]; // exactly 2
  bestFor: string;
  variantRecommendation: string;
  avoidVariant: string;
  monthlyCost: MonthlyCost;
  vsCategory: string;
  /** Enriched server-side with full Car object */
  car?: Car;
}

/** AI-generated honourable mention (candidates 4–5 from scoring) */
export interface HonourableMention {
  carId: string;
  oneLineReason: string;
  /** Enriched server-side with full Car object */
  car?: Car;
}

/** Full API response from POST /api/recommend */
export interface RecommendationResponse {
  shortlist: ShortlistItem[];
  honourableMentions: HonourableMention[];
  summary: string;
  budgetInsight: string;
  cityNote: string;
}

// ─── Chat ────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  /** True while the assistant message is still streaming */
  streaming?: boolean;
}

// ─── Session (SQLite) ────────────────────────────────────────────────────────

export interface Session {
  id: string;
  city: CityId;
  createdAt: number; // unix ms
  updatedAt: number;
  answers: AdvisorAnswers | null;
  shortlist: ShortlistItem[] | null;
  chatHistory: ChatMessage[];
}

export interface SavedCar {
  id: number;
  sessionId: string;
  carId: string;
  variant?: string;
  savedAt: number;
  notes?: string;
}

// ─── Comparison ──────────────────────────────────────────────────────────────

export interface ComparisonCategory {
  name: string;
  winner: string; // car ID
  margin: "close" | "clear" | "dominant";
  explanation: string;
  scores: Record<string, number>;
}

/** Full API response from POST /api/compare */
export interface ComparisonResult {
  verdict: string;
  winnerCarId: string | null;
  categories: ComparisonCategory[];
  whoShouldBuy: Record<string, string>; // carId → "Buy the X if you..."
  priceVerdictNote: string;
}

// ─── Filter/scoring ──────────────────────────────────────────────────────────

/** Car with computed relevance score for a given set of answers */
export interface ScoredCar {
  car: Car;
  score: number;
}
