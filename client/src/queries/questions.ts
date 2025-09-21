import { SelectQuestion } from "@/shared/types/question";
import { api } from "@/utils/treaty";
import { useQuery } from "@tanstack/react-query";

export const useCatalogQuestions = (catalogId: string | null) =>
  useQuery({
    queryKey: ["catalogs", catalogId],
    queryFn: async () => {
      if (!catalogId) {
        return undefined;
      }

      const response = api.api.catalogs({ cid: catalogId }).questions.get();
      if (response.error) {
        throw new Error(
          typeof response.error.value === "string"
            ? response.error.value
            : JSON.stringify(response.error.value)
        );
      }

      return response.data as SelectQuestion[];
    },
  });
