"use client";

interface SentimentBarProps {
  label: string;
  score: number; // 0–5
}

/** Animated bar that fills to (score/5)*100% width on mount. */
export function SentimentBar({ label, score }: SentimentBarProps) {
  const pct = Math.round((score / 5) * 100);

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400 w-20 capitalize shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-brand-navy rounded-full animate-bar-fill"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-medium text-gray-600 w-6 text-right shrink-0">
        {score.toFixed(1)}
      </span>
    </div>
  );
}
