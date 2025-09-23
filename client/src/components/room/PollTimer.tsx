import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { SelectPollWithQuestionAndOptions } from "@/shared/types/poll";
import { usePollMutations } from "@/mutations/polls.mutations";
import { usePollStore } from "@/store/poll.store";

interface PollTimerProps {
  poll: SelectPollWithQuestionAndOptions;
  onExpired?: () => void;
}

export function PollTimer({ poll, onExpired }: PollTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isExpired, setIsExpired] = useState(false);
  const { skipPoll } = usePollMutations();
  const roomId = usePollStore((state) => state.roomId);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiresAt = poll.expiresAt;
      const difference = expiresAt.getTime() - now;

      if (difference <= 0) {
        setTimeLeft(0);
        setIsExpired(true);

        // Skip the poll when it expires
        if (roomId && poll.id) {
          skipPoll.mutate({ roomId, pollId: poll.id });
        }

        onExpired?.();
        return;
      }

      setTimeLeft(difference);
    };

    // Calculate immediately
    calculateTimeLeft();

    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [poll.expiresAt, onExpired, roomId, poll.id, skipPoll]);

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  if (isExpired) {
    return (
      <div className="flex items-center gap-2 text-error">
        <Icon icon="lineicons:clock" className="size-4" />
        <span className="text-sm font-medium">Poll Expired</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-warning">
      <Icon icon="lineicons:clock" className="size-4" />
      <span className="text-sm font-medium">
        {formatTime(timeLeft)} remaining
      </span>
    </div>
  );
}
