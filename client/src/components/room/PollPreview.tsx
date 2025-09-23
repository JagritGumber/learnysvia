import { useState } from "react";
import { Icon } from "@iconify/react";

interface PollPreviewProps {
  question: string;
  options: string[];
  totalResponses?: number;
  correctPercentage?: number;
  timeRemaining?: string;
}

export const PollPreview = ({
  question = "Which fraction is larger?",
  options = ["1/2", "2/3", "3/4"],
  totalResponses = 24,
  correctPercentage = 67,
  timeRemaining = "00:55 remaining",
}: PollPreviewProps) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Mock results data - in a real app this would come from the backend
  const mockResults = [
    { optionIndex: 0, count: 8, percentage: 33 },
    { optionIndex: 1, count: 16, percentage: 67 }, // This is the correct answer
    { optionIndex: 2, count: 0, percentage: 0 },
  ];

  const handleOptionSelect = (index: number) => {
    if (!hasAnswered) {
      setSelectedOption(index);
    }
  };

  const handleSubmitAnswer = () => {
    if (selectedOption !== null && !hasAnswered) {
      setHasAnswered(true);
      // Simulate a brief delay before showing results
      setTimeout(() => {
        setShowResults(true);
      }, 500);
    }
  };

  const handleTryAgain = () => {
    setSelectedOption(null);
    setHasAnswered(false);
    setShowResults(false);
  };

  return (
    <div className="bg-base-200 p-6 rounded-lg border-2 border-base-300">
      <div className="max-w-4xl mx-auto">
        {/* Header - EXACTLY like RoomParticipantView */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h3 className="text-2xl font-bold text-base-content">
              Answer Poll
            </h3>
            <div className="text-sm text-warning font-medium">
              {timeRemaining}
            </div>
          </div>
        </div>

        {/* Poll Question - EXACTLY like RoomParticipantView */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-base-content mb-2">
            Question
          </label>
          <div className="bg-base-100 p-4 rounded-lg border border-base-300">
            <p className="text-base-content">{question}</p>
          </div>
        </div>

        {/* Poll Options - EXACTLY like RoomParticipantView */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-base-content mb-3">
            Select Your Answer
          </label>
          <div className="space-y-3">
            {options.map((option, index) => {
              const result = mockResults[index];
              const isSelected = selectedOption === index;
              const isCorrect = index === 1; // 2/3 is the correct answer

              return (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    showResults
                      ? isCorrect
                        ? "border-success bg-success/5"
                        : isSelected && !isCorrect
                          ? "border-error bg-error/5"
                          : "border-base-300 bg-base-100"
                      : isSelected
                        ? "border-primary bg-primary/5"
                        : "border-base-300 bg-base-100 hover:border-base-content/50"
                  }`}
                  onClick={() => handleOptionSelect(index)}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-sm font-medium text-base-content min-w-fit">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <span className="text-base-content flex-1">{option}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {showResults && (
                      <>
                        <div className="w-16 bg-base-300 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              isCorrect ? "bg-success" : "bg-base-content/30"
                            }`}
                            style={{ width: `${result.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-base-content min-w-fit">
                          {result.count} ({result.percentage}%)
                        </span>
                        {isCorrect && (
                          <Icon
                            icon="lineicons:check-circle"
                            className="text-success size-5"
                          />
                        )}
                        {isSelected && !isCorrect && (
                          <Icon
                            icon="lineicons:close-circle"
                            className="text-error size-5"
                          />
                        )}
                      </>
                    )}

                    {hasAnswered && isSelected && !showResults && (
                      <Icon
                        icon="lineicons:clock"
                        className="text-primary size-5"
                      />
                    )}

                    {!showResults && (
                      <input
                        type="radio"
                        name="poll-answer"
                        checked={isSelected}
                        onChange={() => handleOptionSelect(index)}
                        className="radio radio-primary"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit Button - EXACTLY like RoomParticipantView */}
        <div className="flex justify-end gap-3">
          {!hasAnswered ? (
            <button
              className="btn btn-primary"
              onClick={handleSubmitAnswer}
              disabled={selectedOption === null}
            >
              Submit Answer
            </button>
          ) : !showResults ? (
            <button className="btn btn-primary" disabled>
              <span className="loading loading-spinner loading-sm"></span>
              Submitting...
            </button>
          ) : (
            <button className="btn btn-outline" onClick={handleTryAgain}>
              Try Again
            </button>
          )}
        </div>

        {/* Stats - Only show when results are displayed */}
        {showResults && (
          <div className="flex items-center justify-between text-sm text-base-content/60 pt-4 border-t border-base-300 mt-6">
            <div>Total Responses: {totalResponses}</div>
            <div>Correct: {correctPercentage}%</div>
          </div>
        )}
      </div>
    </div>
  );
};
