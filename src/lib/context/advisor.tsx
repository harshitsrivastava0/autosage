"use client";

import React, { createContext, useContext, useReducer } from "react";
import type { AdvisorAnswers, ShortlistItem, HonourableMention } from "@/types";

export type AdvisorStep =
  | "city"
  | "budget"
  | "usecase"
  | "preferences"
  | "summary"
  | "loading"
  | "results";

export interface AdvisorState {
  step: AdvisorStep;
  answers: Partial<AdvisorAnswers>;
  shortlist: ShortlistItem[];
  honourableMentions: HonourableMention[];
  loading: boolean;
  error: string | null;
}

type AdvisorAction =
  | { type: "SET_STEP"; step: AdvisorStep }
  | { type: "SET_ANSWERS"; answers: Partial<AdvisorAnswers> }
  | { type: "SET_LOADING"; loading: boolean }
  | { type: "SET_RESULTS"; shortlist: ShortlistItem[]; honourableMentions: HonourableMention[] }
  | { type: "SET_ERROR"; error: string }
  | { type: "RESET" };

const INITIAL_STATE: AdvisorState = {
  step: "city",
  answers: {},
  shortlist: [],
  honourableMentions: [],
  loading: false,
  error: null,
};

function advisorReducer(state: AdvisorState, action: AdvisorAction): AdvisorState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, step: action.step };
    case "SET_ANSWERS":
      return { ...state, answers: { ...state.answers, ...action.answers } };
    case "SET_LOADING":
      return { ...state, loading: action.loading };
    case "SET_RESULTS":
      return {
        ...state,
        shortlist: action.shortlist,
        honourableMentions: action.honourableMentions,
        loading: false,
        step: "results",
      };
    case "SET_ERROR":
      return { ...state, error: action.error, loading: false, step: "summary" };
    case "RESET":
      return INITIAL_STATE;
    default:
      return state;
  }
}

interface AdvisorContextValue {
  state: AdvisorState;
  dispatch: React.Dispatch<AdvisorAction>;
}

const AdvisorContext = createContext<AdvisorContextValue>({
  state: INITIAL_STATE,
  dispatch: () => {},
});

export function AdvisorProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(advisorReducer, INITIAL_STATE);

  return (
    <AdvisorContext.Provider value={{ state, dispatch }}>
      {children}
    </AdvisorContext.Provider>
  );
}

export function useAdvisorContext(): AdvisorContextValue {
  return useContext(AdvisorContext);
}
