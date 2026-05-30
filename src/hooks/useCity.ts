"use client";

import { useCityContext } from "@/lib/context/city";

/** Returns the current city and a setter that also persists to localStorage */
export function useCity() {
  return useCityContext();
}
