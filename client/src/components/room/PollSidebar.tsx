import { useState } from "react";
import { Icon } from "@iconify/react";
import { useRoomPolls } from "@/queries/roomPolls.query";
import { QuestionForm } from "@/components/catalog/QuestionForm";
import { SelectPollWithQuestionAndOptions } from "@/shared/types/poll";

interface PollSidebarProps {
  roomId: string;
}

interface PollResultsProps {
  poll: SelectPollWithQuestionAndOptions;
  onClose: () => void;
}

function PollResults({ poll, onClose }: PollResultsProps) {
  const [showQuestionForm, setShowQuestionForm] = useState(false);

  return (
    <div className="flex-1 bg-base-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-base-content">Poll Results</h3>
        <button className="btn btn-ghost btn-sm btn-circle" onClick={onClose}>
          <Icon icon="lineicons:close" className="size-5" />
        </button>
      </div>

      <div className="space-y-6">
        <div className="bg-base-100 p-4 rounded-lg">
          <h4 className="font-semibold text-base-content mb-2">
            Question: {poll.question?.text || "Loading..."}
          </h4>
          <p className="text-sm text-base-content/70">
            Created: {new Date(poll.createdAt).toLocaleString()}
          </p>
        </div>

        <div className="bg-base-100 p-4 rounded-lg">
          <h5 className="font-medium text-base-content mb-3">Results</h5>
          <div className="text-center py-8">
            <Icon
              icon="lineicons:chart-bar"
              className="text-6xl mb-4 text-base-content/30 mx-auto"
            />
            <p className="text-base-content/70">
              No responses yet. Participants will see this poll and their
              answers will appear here.
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            className="btn btn-primary"
            onClick={() => setShowQuestionForm(true)}
          >
            <Icon icon="lineicons:plus" className="w-4 h-4 mr-2" />
            Create Anonymous Poll
          </button>
        </div>
      </div>

      {showQuestionForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-base-100 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <QuestionForm />
            <div className="p-4 border-t border-base-300 flex justify-end gap-2">
              <button
                className="btn btn-ghost"
                onClick={() => setShowQuestionForm(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  // TODO: Handle form submission
                  setShowQuestionForm(false);
                }}
              >
                Create Poll
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function PollSidebar({ roomId }: PollSidebarProps) {
  const [selectedPoll, setSelectedPoll] =
    useState<SelectPollWithQuestionAndOptions | null>(null);
  const { data: polls, isPending, error } = useRoomPolls(roomId);

  if (selectedPoll) {
    return (
      <div className="fixed inset-y-0 right-0 w-96 bg-base-100 border-l border-base-300 flex flex-col z-40">
        <PollResults
          poll={selectedPoll}
          onClose={() => setSelectedPoll(null)}
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-base-100 border-l border-base-300 flex flex-col z-40">
      {/* Header */}
      <div className="p-4 border-b border-base-300">
        <h3 className="text-lg font-semibold text-base-content">Polls</h3>
      </div>

      {/* Create Poll Button */}
      <div className="p-4 border-b border-base-300">
        <button
          className="btn btn-primary w-full"
          onClick={() => {
            // TODO: Open create poll modal
            console.log("Create new poll");
          }}
        >
          <Icon icon="lineicons:plus" className="w-4 h-4 mr-2" />
          Create New Poll
        </button>
      </div>

      {/* Polls List */}
      <div className="flex-1 overflow-y-auto">
        {isPending ? (
          <div className="flex items-center justify-center py-8">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : error ? (
          <div className="p-4 text-center">
            <Icon
              icon="lineicons:warning"
              className="text-4xl mb-2 text-warning mx-auto"
            />
            <p className="text-sm text-base-content/70">Failed to load polls</p>
          </div>
        ) : polls && polls.length > 0 ? (
          <div className="p-2">
            {polls.map((poll) => (
              <button
                key={poll.id}
                onClick={() => setSelectedPoll(poll)}
                className="w-full text-left p-3 rounded-lg mb-2 transition-colors hover:bg-base-200 text-base-content"
              >
                <div className="font-medium text-sm line-clamp-2 mb-1">
                  {poll.question?.text || "Loading question..."}
                </div>
                <div className="text-xs text-base-content/60">
                  {new Date(poll.createdAt).toLocaleString()}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Icon
                icon="lineicons:chart-bar"
                className="text-6xl mb-4 text-base-content/30 mx-auto"
              />
              <h4 className="font-semibold text-base-content mb-2">
                No Polls Yet
              </h4>
              <p className="text-base-content/70 text-sm">
                Create your first poll to get started with engaging your
                participants.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
