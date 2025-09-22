import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ShareRoomModal } from "@/components/modals/ShareRoomModal";
import { CreatePollModal } from "@/components/modals/CreatePollModal";
import { Icon } from "@iconify/react";
import { useRoomById } from "@/queries/roomById.query";
import { useRoomPolls } from "@/queries/roomPolls.query";
import { usePollById } from "@/queries/pollById.query";
import z from "zod";

// Import new components
import {
  RoomLoadingState,
  PollsLoadingState,
  PollLoadingState,
} from "@/components/room/RoomLoadingState";
import {
  RoomErrorState,
  PollsErrorState,
  PollErrorState,
} from "@/components/room/RoomErrorState";
import {
  EmptyPollsState,
  DefaultRoomState,
  PollNotFoundState,
} from "@/components/room/RoomEmptyStates";
import { PollDetails, PollOptions } from "@/components/room/PollDetails";
import { PollAnswerSection } from "@/components/room/PollAnswerSection";
import { PollStatistics } from "@/components/room/PollStatistics";
import { ParticipantsPanel } from "@/components/room/ParticipantsPanel";

// Import custom hooks
import { useRoomWebSocket } from "@/hooks/useRoomWebSocket";
import { usePollManagement } from "@/hooks/usePollManagement";

const searchSchema = z.object({
  pid: z.string(),
  rid: z.string(),
});

export const Route = createFileRoute("/_protected/room/$id")({
  component: RoomPage,
  validateSearch: (search) => searchSchema.parse(search),
});

function RoomPage() {
  const { id } = Route.useParams();
  const search = Route.useSearch();
  const { data, isPending, error } = useRoomById(id);
  const {
    data: pollsData,
    isPending: pollsPending,
    error: pollsError,
  } = useRoomPolls(search.rid);

  // State management
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCreatePollModal, setShowCreatePollModal] = useState(false);

  // Custom hooks
  useRoomWebSocket({ roomId: id, participantId: search.pid });
  const {
    selectedPollId,
    setSelectedPollId,
    handleCreatePoll,
    handleSubmitPollAnswer,
    handleDeletePoll,
    canDeletePoll,
    isSubmittingAnswer,
    isDeletingPoll,
  } = usePollManagement({ roomId: search.rid });

  // Fetch selected poll data
  const {
    data: selectedPoll,
    isPending: pollLoading,
    error: pollError,
  } = usePollById(search.rid, selectedPollId || "");

  // Early returns for loading and error states
  if (isPending) {
    return <RoomLoadingState />;
  }

  if (error || !data?.room) {
    return <RoomErrorState error={error} />;
  }

  if (pollsPending) {
    return <PollsLoadingState />;
  }

  if (pollsError) {
    return <PollsErrorState error={pollsError} />;
  }

  // Show polls if they exist, otherwise show empty state
  const hasPolls = pollsData && pollsData.length > 0;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-base-100 flex">
      {/* Polls Sidebar */}
      <div className="w-80 bg-base-100 border-r border-base-300 flex flex-col">
        <div className="p-4 border-b border-base-300">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-base-content">
              Active Polls
            </h3>
            <div className="flex gap-2">
              <button
                className="btn btn-ghost btn-sm btn-circle"
                onClick={() => setShowShareModal(true)}
                title="Share Room"
              >
                <Icon icon="lineicons:share" className="size-4" />
              </button>
            </div>
          </div>
          <button
            className="btn btn-primary btn-sm mt-2 w-full"
            onClick={() => setShowCreatePollModal(true)}
          >
            <Icon icon="lineicons:plus" className="size-4 mr-2" />
            Create Poll
          </button>
        </div>
        <div className="flex-1 p-2 max-h-[calc(100vh-200px)] overflow-y-auto">
          {hasPolls ? (
            pollsData.map((poll) => (
              <button
                key={poll.id}
                onClick={() => setSelectedPollId(poll.id)}
                className={`w-full text-left p-3 rounded-lg mb-2 transition-colors text-base-content ${
                  selectedPollId === poll.id
                    ? "bg-primary/10 border border-primary/20"
                    : "hover:bg-base-200"
                }`}
              >
                <div className="font-medium text-sm line-clamp-2 mb-2">
                  {poll.question?.text || "Untitled Poll"}
                </div>
                {poll.question?.options && poll.question.options.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {poll.question.options.slice(0, 2).map((option) => (
                      <span
                        key={option.id}
                        className="badge badge-outline badge-xs"
                      >
                        {option.text}
                      </span>
                    ))}
                    {poll.question.options.length > 2 && (
                      <span className="badge badge-outline badge-xs">
                        +{poll.question.options.length - 2}
                      </span>
                    )}
                  </div>
                )}
                <div className="text-xs text-base-content/60">
                  {new Date(poll.createdAt).toLocaleDateString()}
                </div>
              </button>
            ))
          ) : (
            <EmptyPollsState
              onCreatePoll={() => setShowCreatePollModal(true)}
            />
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-4">
          {selectedPollId ? (
            // Show selected poll
            pollLoading ? (
              <PollLoadingState />
            ) : pollError ? (
              <PollErrorState
                error={pollError}
                onBack={() => setSelectedPollId(null)}
              />
            ) : selectedPoll ? (
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setSelectedPollId(null)}
                    >
                      <Icon
                        icon="lineicons:arrow-left"
                        className="size-4 mr-2"
                      />
                      Back to Polls
                    </button>
                    <div className="divider divider-horizontal"></div>
                    <h1 className="text-2xl font-bold text-base-content">
                      {selectedPoll.question?.text || "Untitled Poll"}
                    </h1>
                  </div>
                  <div className="flex gap-2">
                    {canDeletePoll && (
                      <button
                        className="btn btn-ghost btn-sm text-error hover:bg-error hover:text-error-content"
                        onClick={handleDeletePoll}
                        disabled={isDeletingPoll}
                        title="Delete Poll"
                      >
                        {isDeletingPoll ? (
                          <div className="loading loading-spinner loading-sm"></div>
                        ) : (
                          <Icon icon="lineicons:trash-3" className="size-4" />
                        )}
                      </button>
                    )}
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setShowShareModal(true)}
                    >
                      <Icon icon="lineicons:share" className="size-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <PollDetails poll={selectedPoll} />
                  <PollOptions poll={selectedPoll} />
                </div>

                <PollAnswerSection
                  onSubmitAnswer={handleSubmitPollAnswer}
                  isSubmitting={isSubmittingAnswer}
                />

                <PollStatistics poll={selectedPoll} />
              </div>
            ) : (
              <PollNotFoundState onBack={() => setSelectedPollId(null)} />
            )
          ) : (
            <DefaultRoomState
              onCreatePoll={() => setShowCreatePollModal(true)}
              onShareRoom={() => setShowShareModal(true)}
            />
          )}
        </div>
      </div>

      <ParticipantsPanel />

      {showShareModal && data.room && (
        <ShareRoomModal
          room={data.room}
          onClose={() => setShowShareModal(false)}
        />
      )}

      <CreatePollModal
        isOpen={showCreatePollModal}
        onClose={() => setShowCreatePollModal(false)}
        onCreatePoll={handleCreatePoll}
      />
    </div>
  );
}
