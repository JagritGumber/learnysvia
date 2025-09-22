import { Icon } from "@iconify/react";

interface EmptyPollsStateProps {
  onCreatePoll: () => void;
}

export function EmptyPollsState({}: EmptyPollsStateProps) {
  return (
    <div className="flex items-center justify-center h-full text-center p-4">
      <div>
        <Icon
          icon="lineicons:document"
          className="text-4xl mb-4 text-base-content/40 mx-auto"
        />
        <p className="text-sm text-base-content/60">No polls yet</p>
        <p className="text-xs text-base-content/40 mt-1">
          Create your first poll to get started
        </p>
      </div>
    </div>
  );
}

interface DefaultRoomStateProps {
  onCreatePoll: () => void;
  onShareRoom: () => void;
}

export function DefaultRoomState({
  onCreatePoll,
  onShareRoom,
}: DefaultRoomStateProps) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center max-w-md mx-auto">
        <div className="mb-8">
          <Icon
            icon="lineicons:document"
            className="text-6xl mb-6 text-primary mx-auto"
          />
          <h1 className="text-3xl font-bold text-base-content mb-2">
            Select a Poll
          </h1>
          <p className="text-lg text-base-content/70 mb-4">
            Choose a poll from the sidebar to view details and manage it
          </p>
          <p className="text-base-content/70 mb-6">
            Or create a new poll to get started
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4">
          <button className="btn btn-primary btn-lg" onClick={onCreatePoll}>
            <Icon icon="lineicons:plus" className="w-5 h-5 mr-2" />
            Create Poll
          </button>

          <button className="btn btn-outline btn-lg" onClick={onShareRoom}>
            <Icon icon="lineicons:share" className="w-5 h-5 mr-2" />
            Share Room
          </button>
        </div>
      </div>
    </div>
  );
}

export function PollNotFoundState({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <Icon
          icon="lineicons:document"
          className="text-6xl mb-6 text-base-content/40 mx-auto"
        />
        <h2 className="text-2xl font-semibold text-base-content mb-4">
          Poll Not Found
        </h2>
        <p className="text-base-content/70 mb-6">
          The selected poll could not be found or has been deleted.
        </p>
        <button className="btn btn-primary" onClick={onBack}>
          Back to Polls
        </button>
      </div>
    </div>
  );
}
