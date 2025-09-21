import { api } from "@/utils/treaty";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useQuestionMutations = () => {
  const queryClient = useQueryClient();

  const createQuestion = useMutation({
    mutationFn: async ({
      cid,
      text,
      options,
    }: {
      cid: string;
      text: string;
      options: { text: string; isCorrect: boolean }[];
    }) => {
      const response = await api.api.catalogs({ cid }).questions.post({
        text,
        options,
      });
      if (response.error) {
        throw new Error(
          typeof response.error.value === "string"
            ? response.error.value
            : JSON.stringify(response.error.value)
        );
      }
    },
    onSuccess: (_data, { cid }) => {
      queryClient.invalidateQueries({ queryKey: ["catalogs", cid] });
    },
  });

  return { createQuestion };
};
