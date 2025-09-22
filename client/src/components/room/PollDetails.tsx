import { SelectPollWithQuestionAndOptions } from "@/shared/types/poll";

interface PollDetailsProps {
  poll: SelectPollWithQuestionAndOptions;
}

export function PollDetails({ poll }: PollDetailsProps) {
  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body">
        <h3 className="card-title text-lg mb-4">Poll Details</h3>
        <div className="space-y-3">
          <div>
            <span className="text-sm font-medium text-base-content/70">
              Question:
            </span>
            <p className="text-base-content mt-1">
              {poll.question?.text}
            </p>
          </div>
          <div>
            <span className="text-sm font-medium text-base-content/70">
              Created:
            </span>
            <p className="text-base-content mt-1">
              {new Date(poll.createdAt).toLocaleString()}
            </p>
          </div>
          <div>
            <span className="text-sm font-medium text-base-content/70">
              Status:
            </span>
            <div className="badge badge-outline mt-1">Active</div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface PollOptionsProps {
  poll: SelectPollWithQuestionAndOptions;
}

export function PollOptions({ poll }: PollOptionsProps) {
  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body">
        <h3 className="card-title text-lg mb-4">Options</h3>
        {poll.question?.options && poll.question.options.length > 0 ? (
          <div className="space-y-2">
            {poll.question.options.map((option) => (
              <div
                key={option.id}
                className="p-3 bg-base-200 rounded-lg"
              >
                <span className="font-medium">{option.text}</span>
                {option.isCorrect && (
                  <div className="badge badge-success badge-xs ml-2">
                    Correct
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-base-content/60">
            No options available
          </p>
        )}
      </div>
    </div>
  );
}
