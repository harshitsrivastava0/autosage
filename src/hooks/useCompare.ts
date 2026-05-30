"use client";

import { useCompareContext } from "@/lib/context/compare";

/** Returns compare tray state and mutators. Max 4 cars simultaneously */
export function useCompare() {
  return useCompareContext();
}
