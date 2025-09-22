import { useState } from "react";
import { usePollMutations } from "@/mutations/polls.mutations";
import { authClient } from "@/utils/auth-client";
import { useWebsocketStore } from "@/store/websocket";

interface UsePollManagementProps {
  roomId: string;
}

export function usePollManagement({ roomId }: UsePollManagementProps) {
  const [selectedPollId, setSelectedPollId] = useState<string | null>(null);
  const { createPoll, submitPollAnswer, deletePoll } = usePollMutations();
  const { data: session } = authClient.useSession();
  const participants = useWebsocketStore((state) => state.participants);

  const handleCreatePoll = async (questionId: string) => {
    await createPoll.mutateAsync({ roomId, questionId });
  };

  const handleSubmitPollAnswer = async () => {
    if (!selectedPollId) return;

    await submitPollAnswer.mutateAsync({
      roomId,
      pollId: selectedPollId,
    });
  };

  const handleDeletePoll = async () => {
    if (!selectedPollId) return;

    if (
      window.confirm(
        "Are you sure you want to delete this poll? This action cannot be undone."
      )
    ) {
      await deletePoll.mutateAsync({
        roomId,
        pollId: selectedPollId,
      });
      setSelectedPollId(null);
    }
  };

  const canDeletePoll = () => {
    if (!session || !participants) return false;
    const currentParticipant = participants.find((p) => p.userId === session.user.id);
    return currentParticipant?.role === "host";
  };

  return {
    selectedPollId,
    setSelectedPollId,
    handleCreatePoll,
    handleSubmitPollAnswer,
    handleDeletePoll,
    canDeletePoll: canDeletePoll(),
    isCreatingPoll: createPoll.isPending,
    isSubmittingAnswer: submitPollAnswer.isPending,
    isDeletingPoll: deletePoll.isPending,
  };
}
