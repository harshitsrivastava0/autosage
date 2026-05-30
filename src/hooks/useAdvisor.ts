"use client";

import { useAdvisorContext } from "@/lib/context/advisor";
import type { AdvisorAnswers, RecommendationResponse } from "@/types";

const LS_SESSION_KEY = "autosage_session_id";

/**
 * High-level advisor hook.
 *
 * Exposes wizard step machine state plus submitAnswers(), which fires the
 * /api/recommend call and transitions the wizard to 'results' on success.
 */
export function useAdvisor() {
  const { state, dispatch } = useAdvisorContext();

  const setAnswers = (partial: Partial<AdvisorAnswers>) => {
    dispatch({ type: "SET_ANSWERS", answers: partial });
  };

  const setStep = (step: typeof state.step) => {
    dispatch({ type: "SET_STEP", step });
  };

  const reset = () => {
    dispatch({ type: "RESET" });
  };

  const submitAnswers = async (city: string) => {
    if (state.answers.budgetMin == null || state.answers.budgetMax == null || state.answers.budgetMax === 0) {
      dispatch({ type: "SET_ERROR", error: "Budget is required" });
      return;
    }

    dispatch({ type: "SET_STEP", step: "loading" });
    dispatch({ type: "SET_LOADING", loading: true });

    const sessionId =
      (typeof window !== "undefined" && localStorage.getItem(LS_SESSION_KEY)) ||
      crypto.randomUUID();

    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          city,
          answers: {
            budgetMin: state.answers.budgetMin ?? 0,
            budgetMax: state.answers.budgetMax ?? 0,
            useCase: state.answers.useCase ?? [],
            fuelPreference: state.answers.fuelPreference ?? ["any"],
            transmission: state.answers.transmission ?? "any",
            mustHaveFeatures: state.answers.mustHaveFeatures ?? [],
            seatsNeeded: state.answers.seatsNeeded ?? 5,
            prioritize: state.answers.prioritize ?? "features",
          } satisfies AdvisorAnswers,
        }),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        dispatch({ type: "SET_ERROR", error: data.error ?? "Request failed" });
        return;
      }

      const data = await res.json() as RecommendationResponse;
      dispatch({
        type: "SET_RESULTS",
        shortlist: data.shortlist,
        honourableMentions: data.honourableMentions,
      });
    } catch (err) {
      dispatch({ type: "SET_ERROR", error: String(err) });
    }
  };

  return {
    step: state.step,
    answers: state.answers,
    shortlist: state.shortlist,
    honourableMentions: state.honourableMentions,
    loading: state.loading,
    error: state.error,
    setAnswers,
    setStep,
    submitAnswers,
    reset,
  };
}
