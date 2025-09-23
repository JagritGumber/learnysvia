import { useMemo } from "react";
import { usePollMutations } from "@/mutations/polls.mutations";
import { authClient } from "@/utils/auth-client";
import { useWebsocketStore } from "@/store/websocket";
import { usePollManagementStore } from "@/store/pollManagement.store";
import { useShallow } from "zustand/shallow";

interface UsePollManagementProps {
  roomId: string;
}

export function usePollManagement({ roomId }: UsePollManagementProps) {
  const { setSelectedPollId, clearSelectedPoll } = usePollManagementStore();
  const selectedPollId = usePollManagementStore(
    useShallow((state) => state.selectedPollId)
  );
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
    console.log(selectedPollId);
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
      clearSelectedPoll();
    }
  };

  const canDeletePoll = useMemo(() => {
    if (!session || !participants) return false;
    const currentParticipant = participants.find(
      (p) => p.userId === session.user.id
    );
    return currentParticipant?.role === "host";
  }, [session, participants]);

  return {
    selectedPollId,
    setSelectedPollId,
    handleCreatePoll,
    handleSubmitPollAnswer,
    handleDeletePoll,
    canDeletePoll,
    isCreatingPoll: createPoll.isPending,
    isSubmittingAnswer: submitPollAnswer.isPending,
    isDeletingPoll: deletePoll.isPending,
  };
}
