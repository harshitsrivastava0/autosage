"use client";

interface ProgressBarProps {
  value: number; // 0–100
  animated?: boolean;
  className?: string;
}

/** Thin bar with brand-red fill. Uses barFill keyframe when animated */
export function ProgressBar({ value, animated = false, className = "" }: ProgressBarProps) {
  const clampedValue = Math.max(0, Math.min(100, value));

  return (
    <div
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`h-1.5 w-full rounded-full bg-gray-100 overflow-hidden ${className}`}
    >
      <div
        className={`h-full rounded-full bg-brand-red ${animated ? "animate-[barFill_1s_ease-out_forwards]" : ""}`}
        style={animated ? undefined : { width: `${clampedValue}%` }}
      />
    </div>
  );
}
