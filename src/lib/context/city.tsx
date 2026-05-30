"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

const LS_KEY = "autosage_city";
const DEFAULT_CITY = "delhi";

interface CityContextValue {
  city: string;
  setCity: (city: string) => void;
}

const CityContext = createContext<CityContextValue>({
  city: DEFAULT_CITY,
  setCity: () => {},
});

export function CityProvider({ children }: { children: React.ReactNode }) {
  const [city, setCityState] = useState<string>(DEFAULT_CITY);

  // Hydrate from localStorage after mount to avoid SSR mismatch
  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY);
    if (stored) setCityState(stored);
  }, []);

  const setCity = (next: string) => {
    setCityState(next);
    localStorage.setItem(LS_KEY, next);
  };

  return (
    <CityContext.Provider value={{ city, setCity }}>
      {children}
    </CityContext.Provider>
  );
}

export function useCityContext(): CityContextValue {
  return useContext(CityContext);
}
