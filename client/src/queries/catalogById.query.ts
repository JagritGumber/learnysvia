import { SelectCatalog } from "@/shared/types/room";
import { api } from "@/utils/treaty";
import { useQuery } from "@tanstack/react-query";

export const useCatalogById = (catalogId: string | null) =>
  useQuery({
    queryKey: ["catalog", catalogId],
    queryFn: async () => {
      if (!catalogId) return null;

      const response = await api.api.catalogs({ id: catalogId }).get();
      if (response.error) {
        throw new Error(
          typeof response.error.value === "string"
            ? response.error.value
            : JSON.stringify(response.error.value)
        );
      }
      return response.data as SelectCatalog;
    },
    enabled: !!catalogId,
  });
