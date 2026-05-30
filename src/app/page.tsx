import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { CitySelector } from "@/components/ui/CitySelector";
import { CarCard } from "@/components/results/CarCard";
import type { Car } from "@/types";

// Static Creta data for the sample card — no DB or AI calls needed
const SAMPLE_CRETA: Car = {
  id: "hyundai-creta-2024",
  make: "Hyundai",
  model: "Creta",
  variant: "S 1.5 Petrol MT",
  allVariants: [],
  year: 2024,
  bodyType: "suv",
  exShowroomPrice: 1099000,
  onRoadPriceDelhi: 1280000,
  priceRange: { min: 1099000, max: 2099000 },
  engineCC: 1497,
  powerBhp: 115,
  torqueNm: 144,
  fuelType: "petrol",
  transmission: "manual",
  mileageKmpl: 17.4,
  groundClearanceMM: 190,
  seatingCapacity: 5,
  bootLitres: 433,
  driveType: "FWD",
  ncapStars: 5,
  airbagsCount: 6,
  safetyFeatures: ["ESP", "ABS", "ISOFIX", "TPMS", "Hill Assist"],
  keyFeatures: ["Panoramic sunroof", "10.25\" touchscreen", "Ventilated seats", "360-degree camera"],
  imageUrl: "https://stimg.cardekho.com/images/carexteriorimages/630x420/Hyundai/Creta/8667/1755765115423/front-left-side-47.jpg",
  galleryUrls: [],
  availableColors: ["Abyss Black", "Starry Night", "Atlas White"],
  overallRating: 4.7,
  reviewCount: 4823,
  sentimentScores: { mileage: 4.2, performance: 4.4, looks: 4.8, comfort: 4.6, engine: 4.3, interior: 4.7, power: 4.2 },
  expertSummary: "India's best-selling SUV for good reason — best-in-class interior quality, strong safety, and a refined 1.5L petrol that suits city and highway equally.",
  annualServiceCost: 14000,
  insuranceAnnual: 42000,
  resaleValuePct3yr: 68,
  fuelTankLitres: 50,
  realWorldMileageKmpl: 14.5,
  pros: ["Best-in-class interior quality and fit/finish", "5-star Global NCAP safety rating", "Panoramic sunroof standard from mid trims"],
  cons: ["Top variants push past ₹20L", "DCT gearbox can feel jerky in stop-go traffic"],
  targetBuyer: "Urban family wanting premium SUV feel without crossing ₹20L",
  bestFor: ["city_commute", "family_weekends"],
  segment: "mid",
  popularComparisons: ["kia-seltos-2024", "maruti-grand-vitara-2024"],
  waitingPeriodWeeks: null,
};

const HOW_IT_WORKS = [
  {
    step: "1",
    icon: "💬",
    title: "Answer 4 quick questions",
    subtitle: "Budget, use-case, fuel preference, must-haves. Takes ~2 minutes.",
  },
  {
    step: "2",
    icon: "🤖",
    title: "AI analyses 50 cars + 47,000 reviews",
    subtitle: "Claude models every car against your answers in ~8 seconds.",
  },
  {
    step: "3",
    icon: "✅",
    title: "Get your perfect shortlist",
    subtitle: "3 ranked picks with total monthly ownership cost. Instantly.",
  },
];

const PROOF_STATS = [
  { value: "50", label: "Cars analysed" },
  { value: "47k+", label: "Owner reviews" },
  { value: "10", label: "Cities covered" },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-full">
      <Header />

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-brand-navy via-[#16213e] to-[#0f3460] text-white">
        <div className="max-w-4xl mx-auto px-4 py-16 md:py-24 text-center">
          <p className="text-brand-red text-sm font-semibold uppercase tracking-widest mb-4">
            Powered by CarDekho data ecosystem
          </p>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            India&apos;s smartest<br />car advisor.
          </h1>
          <p className="text-lg md:text-xl text-white/75 max-w-2xl mx-auto mb-10 leading-relaxed">
            Tell AutoSage what you need. Get 3 cars that are actually right for you — with real ownership costs, honest tradeoffs, and one-tap comparison.
          </p>

          {/* City selector */}
          <div className="mb-8">
            <p className="text-white/50 text-sm mb-3">Select your city for accurate on-road prices</p>
            <div className="flex justify-center">
              <CitySelector variant="buttons" />
            </div>
          </div>

          <Link
            href="/advisor"
            className="inline-flex items-center gap-2 bg-brand-red hover:bg-brand-red/90 text-white font-semibold px-8 py-4 rounded-full text-lg transition-all hover:scale-105 shadow-lg shadow-brand-red/30"
          >
            Find my car in 2 minutes
            <span className="text-xl">→</span>
          </Link>

          <p className="text-white/40 text-xs mt-4">Free · No account needed · Instant results</p>
        </div>
      </section>

      {/* ── Differentiation strip ────────────────────────────────── */}
      <section className="border-b border-gray-100 bg-brand-surface">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200">
            <div className="py-6 md:py-0 md:px-8 text-center">
              <p className="text-2xl font-bold text-gray-400 mb-1">285 cars</p>
              <p className="text-sm font-semibold text-gray-600 mb-2">CarDekho shows</p>
              <p className="text-xs text-gray-400">Specs &amp; prices, you decide</p>
            </div>
            <div className="py-6 md:py-0 md:px-8 text-center bg-white md:bg-transparent rounded-xl md:rounded-none shadow-sm md:shadow-none">
              <p className="text-2xl font-bold text-brand-navy mb-1">3 right for you</p>
              <p className="text-sm font-semibold text-brand-navy mb-2">AutoSage gives</p>
              <p className="text-xs text-gray-500">+ reasons why, ranked by fit</p>
            </div>
            <div className="py-6 md:py-0 md:px-8 text-center">
              <p className="text-2xl font-bold text-brand-blue mb-1">AI chat advisor</p>
              <p className="text-sm font-semibold text-gray-600 mb-2">AutoSage adds</p>
              <p className="text-xs text-gray-400">Ask anything, anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-brand-navy mb-12">
          How it works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {HOW_IT_WORKS.map(({ step, icon, title, subtitle }) => (
            <div key={step} className="flex flex-col items-center text-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-brand-navy/5 flex items-center justify-center text-3xl">
                  {icon}
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-brand-red text-white text-xs font-bold flex items-center justify-center">
                  {step}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-brand-navy mb-1">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Social proof ─────────────────────────────────────────── */}
      <section className="bg-brand-navy text-white">
        <div className="max-w-4xl mx-auto px-4 py-10">
          <p className="text-center text-white/50 text-sm mb-8 uppercase tracking-widest">
            Built on CarDekho&apos;s data ecosystem
          </p>
          <div className="grid grid-cols-3 gap-4 text-center">
            {PROOF_STATS.map(({ value, label }) => (
              <div key={label}>
                <p className="text-3xl md:text-4xl font-bold text-white mb-1">{value}</p>
                <p className="text-xs md:text-sm text-white/50">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sample card ──────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Preview</p>
          <h2 className="text-2xl md:text-3xl font-bold text-brand-navy">
            This is what your shortlist looks like
          </h2>
          <p className="text-gray-500 mt-2 text-sm">Real ownership costs, honest tradeoffs, one-tap comparison.</p>
        </div>
        <div className="max-w-sm mx-auto">
          <CarCard
            car={SAMPLE_CRETA}
            static
            matchScore={94}
            monthlyCost={{
              emiAt85Pct: 21800,
              fuelMonthly: 8560,
              insuranceMonthly: 3500,
              totalMonthly: 33860,
            }}
          />
        </div>
        <div className="text-center mt-8">
          <Link
            href="/advisor"
            className="inline-flex items-center gap-2 bg-brand-navy hover:bg-brand-navy/90 text-white font-semibold px-7 py-3.5 rounded-full transition-all hover:scale-105"
          >
            Get my personalised shortlist →
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="mt-auto border-t border-gray-100 bg-brand-surface">
        <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <div className="font-semibold text-brand-navy">
            Auto<span className="text-brand-red">Sage</span>
          </div>
          <p>© 2024 AutoSage. Powered by CarDekho data ecosystem.</p>
          <div className="flex gap-4">
            <Link href="/advisor" className="hover:text-brand-navy transition-colors">Advisor</Link>
            <Link href="/compare" className="hover:text-brand-navy transition-colors">Compare</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
