import { SelectQuestion } from "@/shared/types/question";
import { SelectCatalog } from "@/shared/types/room";
import { api } from "@/utils/treaty";
import { useQuery } from "@tanstack/react-query";

export const useCatalogQuestions = (catalogId: string | null) =>
  useQuery({
    queryKey: ["catalogs", catalogId],
    queryFn: async () => {
      if (!catalogId) {
        return null;
      }

      const response = await api.api
        .catalogs({ cid: catalogId })
        .questions.get();
      console.log(response);
      if (response.error) {
        throw new Error(
          typeof response.error.value === "string"
            ? response.error.value
            : JSON.stringify(response.error.value)
        );
      }

      return response.data as {
        questions: SelectQuestion[];
      } & Pick<SelectCatalog, "id" | "name" | "description">;
    },
  });
