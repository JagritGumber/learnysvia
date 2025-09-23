import { useState } from "react";
import { Icon } from "@iconify/react";
import { usePollStore } from "@/store/poll.store";
import { usePollMutations } from "@/mutations/polls.mutations";

export const RoomParticipantView = () => {
  const poll = usePollStore((state) => state.poll);
  const roomId = usePollStore((state) => state.roomId);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const { submitPollAnswer } = usePollMutations();

  const handleSubmitAnswer = async () => {
    console.log(poll, selectedOptionId, roomId);
    if (!poll || !selectedOptionId || !roomId) return;

    try {
      await submitPollAnswer.mutateAsync({
        roomId,
        pollId: poll.id,
        optionId: selectedOptionId,
      });
      setSelectedOptionId(null);
    } catch (error) {
      console.error("Failed to submit poll answer:", error);
    }
  };

  const handleBackToRoom = () => {
    // This could navigate back to room view or close the poll view
    // For now, we'll just reset the poll state
    usePollStore.getState().setPoll(null);
  };

  if (!poll) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-base-200 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
          <h2 className="text-2xl font-semibold text-base-content mb-2">
            Waiting for a poll to come
          </h2>
          <p className="text-base-content/60">
            The host will start a poll soon
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-base-200 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-base-content">Answer Poll</h3>
          <button
            className="btn btn-ghost btn-sm btn-circle"
            onClick={handleBackToRoom}
          >
            <Icon icon="lineicons:close" className="size-5" />
          </button>
        </div>

        {/* Poll Question */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-base-content mb-2">
            Question
          </label>
          <div className="bg-base-100 p-4 rounded-lg border border-base-300">
            <p className="text-base-content">{poll.question.text}</p>
          </div>
        </div>

        {/* Poll Options */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-base-content mb-3">
            Select Your Answer
          </label>
          <div className="space-y-3">
            {poll.question.options.map((option, index) => (
              <div
                key={option.id}
                className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  selectedOptionId === option.id
                    ? "border-primary bg-primary/5"
                    : "border-base-300 bg-base-100 hover:border-base-content/50"
                }`}
                onClick={() => setSelectedOptionId(option.id)}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-sm font-medium text-base-content min-w-fit">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  <span className="text-base-content flex-1">
                    {option.text}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="poll-answer"
                    checked={selectedOptionId === option.id}
                    onChange={() => setSelectedOptionId(option.id)}
                    className="radio radio-primary"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleBackToRoom}
          >
            Back to Room
          </button>
          <button
            className="btn btn-primary"
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
      </div>
    </div>
  );
};
