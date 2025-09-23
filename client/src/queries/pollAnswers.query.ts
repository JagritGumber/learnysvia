import { api } from "@/utils/treaty";
import { useQuery } from "@tanstack/react-query";
import { SelectPollAnswer } from "../../../backend/src/database/schemas";

export const usePollAnswers = (roomId: string, pollId: string) =>
  useQuery({
    queryKey: ["rooms", "polls", roomId, pollId, "answers"],
    queryFn: async () => {
      const response = await api.api
        .rooms({ rid: roomId })
        .polls({ pid: pollId })
        .answers.get();
      if (response.error) {
        throw new Error(
          typeof response.error.value === "string"
            ? response.error.value
            : JSON.stringify(response.error.value)
        );
      }
      return response.data as SelectPollAnswer[];
    },
  });
