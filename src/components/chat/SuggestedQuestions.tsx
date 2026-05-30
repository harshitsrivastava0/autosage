interface SuggestedQuestionsProps {
  context: "results" | "detail";
  carName?: string;
  popularComparison?: string;
  onSelect: (question: string) => void;
}

const RESULTS_QUESTIONS = [
  "What's the total cost of ownership over 5 years?",
  "Which of these is best for city traffic?",
  "Does any of these have a sunroof under ₹15L?",
  "Is diesel worth it for my mileage requirements?",
];

export function SuggestedQuestions({ context, carName, popularComparison, onSelect }: SuggestedQuestionsProps) {
  const questions = context === "detail"
    ? [
        `Which ${carName ?? "this car"} variant gives best value?`,
        `Are there known quality issues with ${carName ?? "this car"}?`,
        popularComparison
          ? `${carName ?? "This car"} vs ${popularComparison} — which is better?`
          : `What's the main competition for ${carName ?? "this car"}?`,
        `What's the real-world mileage of ${carName ?? "this car"}?`,
      ]
    : RESULTS_QUESTIONS;

  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs text-gray-400 px-1">Suggested questions</p>
      {questions.map((q) => (
        <button
          key={q}
          onClick={() => onSelect(q)}
          className="text-left text-xs text-brand-navy bg-brand-navy/5 hover:bg-brand-navy/10 border border-brand-navy/10 rounded-lg px-3 py-2 transition-colors line-clamp-2"
        >
          {q}
        </button>
      ))}
    </div>
  );
}
