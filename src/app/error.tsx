"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 text-center bg-white">
      <div className="w-16 h-16 bg-brand-red/10 rounded-full flex items-center justify-center text-3xl">⚠️</div>
      <div>
        <h1 className="text-xl font-bold text-brand-navy mb-2">Something went wrong</h1>
        <p className="text-sm text-gray-500 max-w-sm">An unexpected error occurred. Your progress has been saved.</p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="bg-brand-navy text-white font-medium px-6 py-2.5 rounded-full hover:bg-brand-navy/90 transition-colors text-sm"
        >
          Try again
        </button>
        <Link href="/" className="text-gray-500 border border-gray-200 px-6 py-2.5 rounded-full hover:border-brand-navy hover:text-brand-navy transition-colors text-sm">
          Go home
        </Link>
      </div>
    </div>
  );
}
