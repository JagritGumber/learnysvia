import { SelectPollWithQuestionAndOptions } from "@/shared/types/poll";

interface PollStatisticsProps {
  poll: SelectPollWithQuestionAndOptions;
}

export function PollStatistics({ poll }: PollStatisticsProps) {
  const totalOptions = poll.question?.options?.length || 0;
  const correctAnswers = poll.question?.options?.filter(
    (option) => option.isCorrect
  ).length || 0;

  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body">
        <h3 className="card-title text-lg mb-4">Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="stat">
            <div className="stat-title">Total Options</div>
            <div className="stat-value text-secondary">
              {totalOptions}
            </div>
          </div>
          <div className="stat">
            <div className="stat-title">Correct Answers</div>
            <div className="stat-value text-success">
              {correctAnswers}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
