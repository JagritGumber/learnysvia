import { api } from "@/utils/treaty";
import { useQuery } from "@tanstack/react-query";

export const usePollAnswerCheck = (roomId: string, pollId: string, userId: string) => {
  return useQuery({
    queryKey: ["polls", pollId, "answers", userId],
    queryFn: async () => {
      if (!roomId || !pollId || !userId) return false;

      const response = await api.api
        .rooms({ rid: roomId })
        .polls({ pid: pollId })
        .answers.me.get();

      if (response.error) {
        throw new Error(
          typeof response.error.value === "string"
            ? response.error.value
            : JSON.stringify(response.error.value)
        );
      }

      return response.data.hasAnswered;
    },
    enabled: !!roomId && !!pollId && !!userId,
  });
};
