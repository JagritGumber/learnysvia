import { SelectPoll } from "@/shared/types/poll";
import { api } from "@/utils/treaty";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const usePollMutations = () => {
  const createPoll = useMutation({
    mutationFn: async ({
      roomId,
      questionId,
    }: {
      roomId: string;
      questionId: string;
    }) => {
      const response = await api.api.rooms({ rid: roomId }).polls.post({
        questionId,
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
    onSuccess: () => {
      toast.success("Created new poll successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create a poll ${error}`);
    },
  });

  return { createPoll };
};
