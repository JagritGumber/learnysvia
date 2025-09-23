import { usePollManagement } from "@/hooks/usePollManagement";
import { usePollById } from "@/queries/pollById.query";
import { useRoomPolls } from "@/queries/roomPolls.query";
import { Icon } from "@iconify/react";
import { useState } from "react";
import { DefaultRoomState, EmptyPollsState } from "./RoomEmptyStates";
import { PollLoadingState } from "./RoomLoadingState";
import { PollErrorState } from "./RoomErrorState";
import { PollDetails, PollOptions } from "./PollDetails";
import { PollAnswerSection } from "./PollAnswerSection";
import { PollStatistics } from "./PollStatistics";
import { ParticipantsPanel } from "./ParticipantsPanel";
import { ShareRoomModal } from "../modals/ShareRoomModal";
import { useRoomById } from "@/queries/roomById.query";
import { CreatePollModal } from "../modals/CreatePollModal";
import { PollQuestionWithStats } from "./PollQuestionWithStats";

export interface RoomHostViewProps {
  rid: string;
}

export const RoomHostView = ({ rid }: RoomHostViewProps) => {
  const {
    selectedPollId,
    setSelectedPollId,
    handleCreatePoll,
    handleSubmitPollAnswer,
    handleDeletePoll,
    canDeletePoll,
    isSubmittingAnswer,
    isDeletingPoll,
  } = usePollManagement({ roomId: rid });

  const {
    data: selectedPoll,
    isPending: pollLoading,
    error: pollError,
  } = usePollById(rid, selectedPollId || "");

  const { data } = useRoomById(rid);

  // State management
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCreatePollModal, setShowCreatePollModal] = useState(false);

  const { data: pollsData } = useRoomPolls(rid);

  // Show polls if they exist, otherwise show empty state
  const hasPolls = pollsData && pollsData.length > 0;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-base-100 flex">
      {/* Polls Sidebar */}
      <div className="bg-base-100 border-r border-base-300 flex flex-col">
        <div className="w-80 p-4 border-b border-base-300">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-base-content">Polls</h3>
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
                <div className="font-medium text-sm line-clamp-2 mb-1">
                  {poll.question?.text || "Untitled Poll"}
                </div>
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
      <div className="w-full">
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
            <PollQuestionWithStats poll={selectedPoll} roomId={rid} />
          ) : (
            <DefaultRoomState
              onCreatePoll={() => setShowCreatePollModal(true)}
              onShareRoom={() => setShowShareModal(true)}
            />
          )
        ) : (
          <DefaultRoomState
            onCreatePoll={() => setShowCreatePollModal(true)}
            onShareRoom={() => setShowShareModal(true)}
          />
        )}
      </div>

      <ParticipantsPanel />

      {showShareModal && data?.room && (
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
};
