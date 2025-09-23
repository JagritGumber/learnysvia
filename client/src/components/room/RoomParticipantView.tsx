import { useState } from "react";
import { usePollStore } from "@/store/poll.store";
import { usePollMutations } from "@/mutations/polls.mutations";

export const RoomParticipantView = () => {
  const poll = usePollStore(state => state.poll);
  const roomId = usePollStore(state => state.roomId)
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const { submitPollAnswer } = usePollMutations();

  const handleSubmitAnswer = async () => {
    if (!poll || !selectedOptionId || !roomId) return;

    try {
      await submitPollAnswer.mutateAsync({
        roomId,
        pollId: poll.id,
      });
      setSelectedOptionId(null);
    } catch (error) {
      console.error("Failed to submit poll answer:", error);
    }
  };

  if (!poll) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
          <h2 className="text-2xl font-semibold text-base-content mb-2">
            Waiting for a poll to come
          </h2>
          <p className="text-base-content/60">The host will start a poll soon</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-base-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Poll Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-base-content mb-4">
            Poll Question
          </h1>
          <div className="card bg-base-200 shadow-lg">
            <div className="card-body">
              <p className="text-lg text-base-content">
                {poll.question.text}
              </p>
            </div>
          </div>
        </div>

        {/* Poll Options */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {poll.question.options.map((option) => (
            <div
              key={option.id}
              className={`card cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedOptionId === option.id
                  ? "bg-primary text-primary-content shadow-lg ring-2 ring-primary"
                  : "bg-base-200 hover:bg-base-300"
              }`}
              onClick={() => setSelectedOptionId(option.id)}
            >
              <div className="card-body p-6">
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedOptionId === option.id
                        ? "bg-primary-content border-primary-content"
                        : "border-base-content"
                    }`}
                  >
                    {selectedOptionId === option.id && (
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    )}
                  </div>
                  <p className="text-base-content flex-1">{option.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="text-center mt-8">
          <button
            className={`btn btn-lg ${
              selectedOptionId
                ? "btn-primary"
                : "btn-disabled"
            }`}
            onClick={handleSubmitAnswer}
            disabled={!selectedOptionId || submitPollAnswer.isPending}
          >
            {submitPollAnswer.isPending ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Submitting...
              </>
            ) : (
              "Submit Answer"
            )}
          </button>
        </div>

        {/* Poll Info */}
        <div className="text-center mt-6 text-base-content/60">
          <p>Select an option above and click submit to answer the poll</p>
        </div>
      </div>
    </div>
  );
};
