import { SelectPoll } from "@/shared/types/poll";
import { usePollSubmissionStore } from "@/store/pollSubmission.store";
import { api } from "@/utils/treaty";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const usePollMutations = () => {
  const queryClient = useQueryClient();

  const createPoll = useMutation({
    mutationFn: async ({
      roomId,
      questionId,
      timeLimit,
    }: {
      roomId: string;
      questionId: string;
      timeLimit?: number;
    }) => {
      const response = await api.api.rooms({ rid: roomId }).polls.post({
        questionId,
        timeLimit,
      });

      if (response.error) {
        throw new Error(
          typeof response.error.value === "string"
            ? response.error.value
            : JSON.stringify(response.error.value)
        );
      }
      return response.data as SelectPoll;
    },
    onSuccess: (_data, { roomId }) => {
      queryClient.invalidateQueries({ queryKey: ["rooms", "polls", roomId] });
      toast.success("Created new poll successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create a poll ${error}`);
    },
  });

  const submitPollAnswer = useMutation({
    mutationFn: async ({
      roomId,
      pollId,
      optionId,
    }: {
      roomId: string;
      pollId: string;
      optionId: string;
    }) => {
      const response = await api.api
        .rooms({ rid: roomId })
        .polls({ pid: pollId })
        .answers.post({
          optionId,
        });
      console.log(response);

      if (response.error) {
        throw new Error(
          typeof response.error.value === "string"
            ? response.error.value
            : JSON.stringify(response.error.value)
        );
      }
      return response.data;
    },
    onSuccess: (_data, { roomId, pollId, optionId }) => {
      queryClient.invalidateQueries({ queryKey: ["rooms", "polls", roomId] });
      queryClient.invalidateQueries({
        queryKey: ["rooms", "polls", roomId, pollId],
      });

      // Mark poll as submitted in the store
      if (optionId) {
        // Mark as answered if optionId is provided
        usePollSubmissionStore.getState().markPollAsAnswered(pollId);
      } else {
        // Mark as skipped if optionId is empty
        usePollSubmissionStore.getState().markPollAsSkipped(pollId);
      }
    },
    onError: (error) => {
      console.error(`Failed to submit poll answer: ${error.message}`);
      // Removed toast notification to prevent screen flooding
    },
  });

  const skipPoll = useMutation({
    mutationFn: async ({
      roomId,
      pollId,
    }: {
      roomId: string;
      pollId: string;
    }) => {
      const response = await api.api
        .rooms({ rid: roomId })
        .polls({ pid: pollId })
        .skip.post();

      if (response.error) {
        throw new Error(
          typeof response.error.value === "string"
            ? response.error.value
            : JSON.stringify(response.error.value)
        );
      }
      return response.data;
    },
    onSuccess: (_data, { roomId, pollId }) => {
      queryClient.invalidateQueries({ queryKey: ["rooms", "polls", roomId] });
      queryClient.invalidateQueries({
        queryKey: ["rooms", "polls", roomId, pollId],
      });
    },
    onError: (error) => {
      console.error(`Failed to skip poll answer: ${error.message}`);
    },
  });

  const deletePoll = useMutation({
    mutationFn: async ({
      roomId,
      pollId,
    }: {
      roomId: string;
      pollId: string;
    }) => {
      const response = await api.api
        .rooms({ rid: roomId })
        .polls({ pid: pollId })
        .delete();

      if (response.error) {
        throw new Error(
          typeof response.error.value === "string"
            ? response.error.value
            : JSON.stringify(response.error.value)
        );
      }
      return response.data;
    },
    onSuccess: (_data, { roomId, pollId }) => {
      queryClient.invalidateQueries({ queryKey: ["rooms", "polls", roomId] });
      queryClient.invalidateQueries({
        queryKey: ["rooms", "polls", roomId, pollId],
      });
      toast.success("Poll deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete poll: ${error.message}`);
    },
  });

  return { createPoll, submitPollAnswer, skipPoll, deletePoll };
};
