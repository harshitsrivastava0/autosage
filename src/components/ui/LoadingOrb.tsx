"use client";

interface LoadingOrbProps {
  className?: string;
}

/**
 * Three concentric rings rotating at different speeds using spin-slow keyframe variants.
 * Pure CSS — no animation library required.
 */
export function LoadingOrb({ className = "" }: LoadingOrbProps) {
  return (
    <div className={`relative flex items-center justify-center ${className || "w-16 h-16"}`}>
      {/* Outer ring — slowest */}
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-brand-navy animate-[spin-slow_3s_linear_infinite]" />
      {/* Middle ring — medium */}
      <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-brand-red animate-[spin-slow_2s_linear_infinite_reverse]" />
      {/* Inner ring — fastest */}
      <div className="absolute inset-4 rounded-full border-2 border-transparent border-t-brand-navy opacity-60 animate-[spin-slow_1.5s_linear_infinite]" />
      {/* Centre dot */}
      <div className="absolute inset-[30%] rounded-full bg-brand-red opacity-80" />
    </div>
  );
}
