import { Icon } from "@iconify/react";
import { authClient } from "@/utils/auth-client";
import { useWebsocketStore } from "@/store/websocket";

interface PollAnswerSectionProps {
  onSubmitAnswer: () => void;
  isSubmitting: boolean;
}

export function PollAnswerSection({
  onSubmitAnswer,
  isSubmitting,
}: PollAnswerSectionProps) {
  const { data: session } = authClient.useSession();
  const participants = useWebsocketStore((state) => state.participants);

  if (!session) {
    return (
      <div className="alert alert-warning">
        <Icon icon="lineicons:warning" className="size-4" />
        <span>Please wait while we load your session information...</span>
      </div>
    );
  }

  const currentParticipant = participants?.find(
    (p) => p.userId === session.user.id
  );

  if (currentParticipant?.role === "host") {
    return (
      <div className="alert alert-info">
        <Icon icon="lineicons:info" className="size-4" />
        <span>
          You are the host of this room. Poll hosts cannot submit answers.
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-base-content/70">
        Submit your answer to participate in this poll.
      </p>
      <button
        className="btn btn-primary w-full"
        onClick={onSubmitAnswer}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <div className="loading loading-spinner loading-sm mr-2"></div>
            Submitting...
          </>
        ) : (
          <>
            <Icon icon="lineicons:check" className="size-4 mr-2" />
            Submit Answer
          </>
        )}
      </button>
    </div>
  );
}
