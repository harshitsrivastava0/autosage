"use client";

import { Header } from "@/components/layout/Header";
import { QuestionnaireWizard } from "@/components/advisor/QuestionnaireWizard";
import { LoadingState } from "@/components/advisor/LoadingState";
import { ResultsSection } from "@/components/results/ResultsSection";
import { useAdvisor } from "@/hooks/useAdvisor";
import { useCity } from "@/hooks/useCity";
import { useSession } from "@/hooks/useSession";

const WIZARD_STEPS = ["city", "budget", "usecase", "preferences", "summary"] as const;

export default function AdvisorPage() {
  const { city } = useCity();
  const { sessionId } = useSession();
  const { step, answers, shortlist, honourableMentions, error, setAnswers, setStep, submitAnswers } = useAdvisor();

  const handleSubmit = () => {
    submitAnswers(city);
  };

  const isWizardStep = WIZARD_STEPS.includes(step as typeof WIZARD_STEPS[number]);

  return (
    <div className="flex flex-col min-h-full">
      <Header />

      <main className="flex-1">
        {error && isWizardStep && (
          <div className="max-w-lg mx-auto px-4 pt-4">
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{error}</div>
          </div>
        )}

        {isWizardStep && (
          <QuestionnaireWizard
            answers={answers}
            onAnswersChange={setAnswers}
            onSubmit={handleSubmit}
          />
        )}

        {step === "loading" && (
          <LoadingState answers={answers} city={city} />
        )}

        {step === "results" && (
          <ResultsSection
            shortlist={shortlist}
            honourableMentions={honourableMentions}
            sessionId={sessionId || undefined}
            onRefine={() => setStep("summary")}
          />
        )}
      </main>
    </div>
  );
}
