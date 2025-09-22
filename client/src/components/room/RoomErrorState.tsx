import { Icon } from "@iconify/react";

interface RoomErrorStateProps {
  error: string | Error | null;
}

export function RoomErrorState({ error }: RoomErrorStateProps) {
  return (
    <div className="min-h-screen bg-base-100 flex flex-col items-center justify-center">
      <Icon icon="lineicons:ban" className="text-8xl mb-6 text-error" />
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-base-content mb-4">
          {typeof error === "string"
            ? error
            : error?.message || "Room not found"}
        </h2>
        <p className="text-base-content/70 mb-6">
          The room you're looking for doesn't exist or you don't have access
          to it.
        </p>
      </div>
    </div>
  );
}

interface PollsErrorStateProps {
  error: string | Error | null;
}

export function PollsErrorState({ error }: PollsErrorStateProps) {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-base-100 flex flex-col items-center justify-center">
      <Icon icon="lineicons:warning" className="text-6xl mb-6 text-warning" />
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-base-content mb-4">
          Error Loading Polls
        </h2>
        <p className="text-base-content/70 mb-6">
          {typeof error === "string"
            ? error
            : error?.message || "Failed to load polls"}
        </p>
        <button
          className="btn btn-primary"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

interface PollErrorStateProps {
  error: string | Error | null;
  onBack: () => void;
}

export function PollErrorState({ error, onBack }: PollErrorStateProps) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <Icon
          icon="lineicons:warning"
          className="text-6xl mb-6 text-warning mx-auto"
        />
        <h2 className="text-2xl font-semibold text-base-content mb-4">
          Error Loading Poll
        </h2>
        <p className="text-base-content/70 mb-6">
          {typeof error === "string"
            ? error
            : error?.message || "Failed to load poll"}
        </p>
        <button
          className="btn btn-primary"
          onClick={onBack}
        >
          Back to Polls
        </button>
      </div>
    </div>
  );
}
