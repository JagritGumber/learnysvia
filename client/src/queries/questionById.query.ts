import { SelectQuestion } from "@/shared/types/question";
import { api } from "@/utils/treaty";
import { useQuery } from "@tanstack/react-query";

export const useQuestionById = (
  catalogId: string | null,
  questionId: string | null
) =>
  useQuery({
    queryKey: ["questions", questionId],
    queryFn: async () => {
      if (!catalogId || !questionId) {
        return null;
      }

      const response = await api.api
        .catalogs({ cid: catalogId })
        .questions({ qid: questionId })
        .get();
      console.log(response);
      if (response.error) {
        throw new Error(
          typeof response.error.value === "string"
            ? response.error.value
            : JSON.stringify(response.error.value)
        );
      }

      return response.data as {
        question: SelectQuestion & {
          options: Array<{
            id: string;
            text: string;
            isCorrect: boolean;
            questionId: string;
          }>;
        };
      };
    },
    enabled: !!catalogId && !!questionId,
  });
