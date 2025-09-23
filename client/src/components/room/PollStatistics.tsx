import { SelectPollWithQuestionAndOptions } from "@/shared/types/poll";
import { usePollAnswers } from "@/queries/pollAnswers.query";
import { usePollManagement } from "@/hooks/usePollManagement";
import { Icon } from "@iconify/react";

interface PollStatisticsProps {
  poll: SelectPollWithQuestionAndOptions;
  roomId: string;
}

export function PollStatistics({ poll, roomId }: PollStatisticsProps) {
  // Get poll answers to calculate statistics
  const { data: pollAnswers } = usePollAnswers(roomId, poll.id);

  // Get poll management functions for delete functionality
  const { handleDeletePoll, canDeletePoll, isDeletingPoll } = usePollManagement(
    { roomId }
  );

  // Use stored participant count from poll creation (consistent)
  const totalParticipants = poll.totalParticipantsAtCreation || 0;
  const answeredCount = pollAnswers?.length || 0;
  const totalOptions = poll.question?.options?.length || 0;
  const correctAnswers =
    poll.question?.options?.filter((option) => option.isCorrect).length || 0;

  console.log(poll);

  // Use stored final results if available, otherwise calculate in real-time
  const finalResults = poll.finalResults;
  const answerDistribution =
    finalResults ||
    poll.question?.options?.map((option) => {
      const count =
        pollAnswers?.filter((answer) => answer.optionId === option.id).length ||
        0;
      return {
        option: option.text,
        count,
        percentage:
          totalParticipants > 0 ? (count / totalParticipants) * 100 : 0,
        isCorrect: option.isCorrect,
      };
    }) ||
    [];

  // Normalize the data to ensure consistent property names
  const normalizedDistribution = answerDistribution.map((item) => ({
    option: "optionText" in item ? item.optionText : item.option,
    count: item.count,
    percentage: item.percentage,
    isCorrect: item.isCorrect,
  }));

  const allAnswered =
    answeredCount === totalParticipants && totalParticipants > 0;
  const hasExpired = poll.expiresAt && new Date(poll.expiresAt) < new Date();

  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body">
        <div className="flex justify-between items-center mb-4">
          <h3 className="card-title text-lg">Poll Progress & Statistics</h3>
          {canDeletePoll && (
            <button
              className={`btn btn-ghost btn-sm btn-circle ${isDeletingPoll ? "loading" : ""}`}
              onClick={handleDeletePoll}
              title="Delete Poll"
              disabled={isDeletingPoll}
            >
              <Icon icon="lineicons:trash-3" className="size-4" />
            </button>
          )}
        </div>

        {/* Progress Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-base-content">
              Responses ({answeredCount}/{totalParticipants})
            </span>
            <span className="text-xs text-base-content/60">
              {hasExpired ? "Expired" : "Active"}
            </span>
          </div>

          <div className="w-full bg-base-200 rounded-full h-2 mb-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                allAnswered ? "bg-success" : "bg-primary"
              }`}
              style={{
                width: `${totalParticipants > 0 ? (answeredCount / totalParticipants) * 100 : 0}%`,
              }}
            ></div>
          </div>

          {allAnswered && (
            <div className="alert alert-success">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>All participants have answered!</span>
            </div>
          )}
        </div>

        {/* Results Section - Show when all answered */}
        {allAnswered && (
          <div className="space-y-4">
            <h4 className="font-semibold text-base-content">Results</h4>

            {normalizedDistribution.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-base-content">
                    {item.option}
                    {item.isCorrect && (
                      <span className="badge badge-success badge-xs ml-2">
                        Correct
                      </span>
                    )}
                  </span>
                  <span className="text-sm text-base-content/70">
                    {item.count} ({item.percentage.toFixed(1)}%)
                  </span>
                </div>

                <div className="w-full bg-base-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      item.isCorrect ? "bg-success" : "bg-primary"
                    }`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}

            <div className="divider"></div>

            <div className="grid grid-cols-2 gap-4">
              <div className="stat">
                <div className="stat-title">Total Options</div>
                <div className="stat-value text-secondary">{totalOptions}</div>
              </div>
              <div className="stat">
                <div className="stat-title">Correct Answers</div>
                <div className="stat-value text-success">{correctAnswers}</div>
              </div>
            </div>
          </div>
        )}

        {/* Show message when poll is still active */}
        {!allAnswered && !hasExpired && (
          <div className="alert alert-info">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Waiting for all participants to answer...</span>
          </div>
        )}
      </div>
    </div>
  );
}
