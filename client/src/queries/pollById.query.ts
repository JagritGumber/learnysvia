import { SelectPollWithQuestionAndOptions } from "@/shared/types/poll";
import { api } from "@/utils/treaty";
import { useQuery } from "@tanstack/react-query";

export const usePollById = (roomId: string, pollId: string) =>
  useQuery({
    queryKey: ["polls", roomId, pollId],
    queryFn: async () => {
      const response = await api.api
        .rooms({ rid: roomId })
        .polls({ pid: pollId })
        .get();
      if (response.error) {
        throw new Error(
          typeof response.error.value === "string"
            ? response.error.value
            : JSON.stringify(response.error.value)
        );
      }
      return response.data as SelectPollWithQuestionAndOptions;
    },
  });
