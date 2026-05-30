import type { Car } from "@/types";
import { SentimentBar } from "@/components/results/SentimentBar";

const SENTIMENT_LABELS: (keyof Car["sentimentScores"])[] = [
  "mileage", "performance", "looks", "comfort", "engine", "interior", "power",
];

function buildInsight(car: Car): string {
  const scores = car.sentimentScores;
  const sorted = SENTIMENT_LABELS.slice().sort((a, b) => scores[b] - scores[a]);
  const top = sorted.slice(0, 2).map((k) => k);
  const low = sorted[sorted.length - 1];
  return `Owners love the ${top.join(" and ")}. Common complaint: ${low}.`;
}

const SAMPLE_REVIEWS = [
  { author: "Rahul K., Delhi", text: "Best car I've owned. Fuel efficiency is excellent for city commute and the features are top-notch.", rating: 5 },
  { author: "Priya M., Bangalore", text: "Interior quality is great. Sunroof is a big plus. Service centre experience was average.", rating: 4 },
  { author: "Amit S., Mumbai", text: "Comfortable on highways. Boot space is adequate. A bit pricey for top variant.", rating: 4 },
];

interface ReviewsSectionProps {
  car: Car;
}

export function ReviewsSection({ car }: ReviewsSectionProps) {
  const insight = buildInsight(car);

  return (
    <div className="space-y-6">
      {/* Overall rating */}
      <div className="flex items-center gap-4">
        <div className="text-center">
          <div className="text-5xl font-bold text-brand-navy">{car.overallRating}</div>
          <div className="flex gap-0.5 mt-1 justify-center">
            {[1, 2, 3, 4, 5].map((s) => (
              <span key={s} className={`text-lg ${s <= Math.round(car.overallRating) ? "text-amber-400" : "text-gray-200"}`}>★</span>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-1">{car.reviewCount.toLocaleString("en-IN")} reviews</p>
        </div>
        <div className="flex-1 space-y-1.5">
          {SENTIMENT_LABELS.map((key) => (
            <SentimentBar key={key} label={key} score={car.sentimentScores[key]} />
          ))}
        </div>
      </div>

      {/* AI insight */}
      <div className="bg-brand-navy/5 rounded-xl p-4 border border-brand-navy/10">
        <p className="text-xs text-brand-navy font-semibold mb-1">AutoSage insight</p>
        <p className="text-sm text-gray-700">{insight}</p>
      </div>

      {/* Sample reviews */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-700 text-sm">Owner reviews</h3>
        {SAMPLE_REVIEWS.map((review) => (
          <div key={review.author} className="border border-gray-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span key={s} className={`text-sm ${s <= review.rating ? "text-amber-400" : "text-gray-200"}`}>★</span>
                ))}
              </div>
              <span className="text-xs text-gray-400">{review.author}</span>
            </div>
            <p className="text-sm text-gray-700">{review.text}</p>
          </div>
        ))}
        <p className="text-xs text-gray-400 text-center">Review excerpts are representative of owner sentiment from the CarDekho dataset.</p>
      </div>
    </div>
  );
}
