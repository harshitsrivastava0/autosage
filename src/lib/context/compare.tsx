"use client";

import React, { createContext, useContext, useState } from "react";

const MAX_COMPARE = 4;

interface CompareContextValue {
  selectedIds: string[];
  addCar: (id: string) => void;
  removeCar: (id: string) => void;
  clearAll: () => void;
  canAdd: boolean;
}

const CompareContext = createContext<CompareContextValue>({
  selectedIds: [],
  addCar: () => {},
  removeCar: () => {},
  clearAll: () => {},
  canAdd: true,
});

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const addCar = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) || prev.length >= MAX_COMPARE ? prev : [...prev, id]
    );
  };

  const removeCar = (id: string) => {
    setSelectedIds((prev) => prev.filter((x) => x !== id));
  };

  const clearAll = () => setSelectedIds([]);

  return (
    <CompareContext.Provider
      value={{ selectedIds, addCar, removeCar, clearAll, canAdd: selectedIds.length < MAX_COMPARE }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompareContext(): CompareContextValue {
  return useContext(CompareContext);
}
