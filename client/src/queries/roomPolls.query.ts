import { api } from "@/utils/treaty";
import { useQuery } from "@tanstack/react-query";
import { SelectPollWithQuestionAndOptions } from "@/shared/types/poll";

export const useRoomPolls = (rid: string) =>
  useQuery({
    queryKey: ["rooms", "polls", rid],
    queryFn: async () => {
      const response = await api.api.rooms({ rid }).polls.get();

      if (response.error) {
        throw new Error(
          typeof response.error.value === "string"
            ? response.error.value
            : JSON.stringify(response.error.value)
        );
      }
      return response.data as SelectPollWithQuestionAndOptions[];
    },
  });
