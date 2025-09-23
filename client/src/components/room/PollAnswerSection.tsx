import { Icon } from "@iconify/react";
import { authClient } from "@/utils/auth-client";
import { useWebsocketStore } from "@/store/websocket";
import { SelectPollWithQuestionAndOptions } from "@/shared/types/poll";
import { usePollAnswerCheck } from "@/queries/pollAnswerCheck.query";

interface PollAnswerSectionProps {
  onSubmitAnswer: () => void;
  isSubmitting: boolean;
  poll?: SelectPollWithQuestionAndOptions;
  roomId?: string;
}

export function PollAnswerSection({
  onSubmitAnswer,
  isSubmitting,
  poll,
  roomId,
}: PollAnswerSectionProps) {
  const { data: session } = authClient.useSession();
  const participants = useWebsocketStore((state) => state.participants);

  // Check if user has already answered this poll
  const { data: hasAnswered } = usePollAnswerCheck(
    roomId || "",
    poll?.id || "",
    session?.user.id || ""
  );

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

  if (hasAnswered) {
    return (
      <div className="alert alert-success">
        <Icon icon="lineicons:check-circle" className="size-4" />
        <span>You have already submitted your answer for this poll.</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-base-content/70">
          Submit your answer to participate in this poll.
        </p>
        {poll?.timeLimit && (
          <div className="badge badge-warning badge-sm">
            <Icon icon="lineicons:clock" className="size-3 mr-1" />
            {poll.timeLimit} min
          </div>
        )}
      </div>
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
