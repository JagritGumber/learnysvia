import { useState } from "react";
import { usePollMutations } from "@/mutations/polls.mutations";
import { authClient } from "@/utils/auth-client";
import { useWebsocketStore } from "@/store/websocket";
import { useShallow } from "zustand/shallow";

interface UsePollManagementProps {
  roomId: string;
}

export function usePollManagement({ roomId }: UsePollManagementProps) {
  const [selectedPollId, setSelectedPollId] = useState<string | null>(null);
  const { createPoll, submitPollAnswer, deletePoll } = usePollMutations();
  const { data: session } = authClient.useSession();
  const participants = useWebsocketStore(
    useShallow((state) => state.participants)
  );

  const handleCreatePoll = async (
    questionId: string,
    timeLimit: number = 1
  ) => {
    const result = await createPoll.mutateAsync({
      roomId,
      questionId,
      timeLimit,
    });
    // Automatically select the newly created poll
    setSelectedPollId(result.id);
  };

  const handleSubmitPollAnswer = async (optionId?: string) => {
    if (!selectedPollId) return;

    if (optionId) {
      await submitPollAnswer.mutateAsync({
        roomId,
        pollId: selectedPollId,
        optionId,
      });
    } else {
      // Skip the poll if no option selected
      await submitPollAnswer.mutateAsync({
        roomId,
        pollId: selectedPollId,
        optionId: "", // Empty string for skip
      });
    }
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
    console.log(participants);
    if (!session || !participants) return false;
    const currentParticipant = participants.find(
      (p) => p.userId === session.user.id
    );
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
