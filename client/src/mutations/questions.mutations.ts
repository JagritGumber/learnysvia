import { api } from "@/utils/treaty";
import { useMutation } from "@tanstack/react-query";

export const useQuestionMutations = () => {
  const createQuestion = useMutation({
    mutationFn: async ({ cid, text }: { cid: string; text: string }) => {
      const response = await api.api.catalogs({ cid }).questions.post({
        text,
      });
      if (response.error) {
        throw new Error(
          typeof response.error.value === "string"
            ? response.error.value
            : JSON.stringify(response.error.value)
        );
      }
    },
  });

  return { createQuestion };
};
