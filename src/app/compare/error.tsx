"use client";

export default function CompareError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4 text-center">
      <div className="w-14 h-14 bg-brand-red/10 rounded-full flex items-center justify-center text-2xl">⚠️</div>
      <div>
        <h2 className="text-lg font-bold text-brand-navy mb-2">Comparison failed</h2>
        <p className="text-sm text-gray-500">The comparison couldn&apos;t be loaded. Please try again.</p>
      </div>
      <button onClick={reset} className="bg-brand-navy text-white font-medium px-6 py-2.5 rounded-full hover:bg-brand-navy/90 transition-colors text-sm">
        Try again
      </button>
    </div>
  );
}
