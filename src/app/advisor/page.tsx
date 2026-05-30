"use client";

import { Header } from "@/components/layout/Header";
import { QuestionnaireWizard } from "@/components/advisor/QuestionnaireWizard";
import { LoadingState } from "@/components/advisor/LoadingState";
import { SetupRequired } from "@/components/advisor/SetupRequired";
import { ResultsSection } from "@/components/results/ResultsSection";
import { useAdvisor } from "@/hooks/useAdvisor";
import { useCity } from "@/hooks/useCity";
import { useSession } from "@/hooks/useSession";

const SETUP_ERROR = "AI service not configured. Please set ANTHROPIC_API_KEY.";
const WIZARD_STEPS = ["city", "budget", "usecase", "preferences", "summary"] as const;

export default function AdvisorPage() {
  const { city } = useCity();
  const { sessionId } = useSession();
  const { step, answers, shortlist, honourableMentions, error, setAnswers, setStep, submitAnswers, reset } = useAdvisor();

  const handleSubmit = () => {
    submitAnswers(city);
  };

  const isWizardStep = WIZARD_STEPS.includes(step as typeof WIZARD_STEPS[number]);
  const isSetupError = error === SETUP_ERROR;

  return (
    <div className="flex flex-col min-h-full">
      <Header />

      <main className="flex-1">
        {isSetupError ? (
          <div className="space-y-4">
            <SetupRequired />
            <div className="text-center">
              <button onClick={reset} className="text-sm text-gray-400 hover:text-gray-600 underline">
                Try again
              </button>
            </div>
          </div>
        ) : isWizardStep && (
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
