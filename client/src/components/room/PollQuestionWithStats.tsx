import { usePollAnswers } from "@/queries/pollAnswers.query";
import { SelectPollWithQuestionAndOptions } from "@/shared/types/poll";

interface PollQuestionWithStatsProps {
  poll: SelectPollWithQuestionAndOptions;
  roomId: string;
}

export function PollQuestionWithStats({
  poll,
  roomId,
}: PollQuestionWithStatsProps) {
  // Get poll answers to calculate statistics
  const { data: pollAnswers } = usePollAnswers(roomId, poll.id);

  const totalParticipants = poll.totalParticipantsAtCreation || 0;
  const answeredCount = pollAnswers?.length || 0;

  return (
    <div className="p-8 w-full bg-base-100 h-full">
      <div className="mb-6">
        <label className="block text-sm font-medium text-base-content mb-3">
          Question
        </label>
        <div className="bg-base-200 rounded-md p-4">
          <p className="text-base-content text-lg">
            {poll.question?.text || "No question text"}
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-base-content mb-3">
          Answer Options
        </label>
        <div className="space-y-3">
          {poll.question?.options?.map((option, index) => {
            const answerCount =
              pollAnswers?.filter((answer) => answer.optionId === option.id)
                .length || 0;
            const percentage =
              totalParticipants > 0
                ? (answerCount / totalParticipants) * 100
                : 0;

            return (
              <div
                key={option.id}
                className="flex items-center gap-3 p-4 bg-base-100"
              >
                <span className="text-sm font-medium text-base-content min-w-fit">
                  {String.fromCharCode(65 + index)}.
                </span>
                <span className="text-base-content flex-1">{option.text}</span>
                {option.isCorrect && (
                  <div className="badge badge-success badge-sm">Correct</div>
                )}
                {answeredCount > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-base-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-base-content min-w-fit">
                      {answerCount} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
