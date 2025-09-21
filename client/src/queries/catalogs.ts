import { SelectCatalogWithParticipantCount } from "@/shared/types/room";
import { api } from "@/utils/treaty";
import { useQuery } from "@tanstack/react-query";

export const useCatalogs = () =>
  useQuery({
    queryKey: ["catalogs"],
    queryFn: async () => {
      const response = await api.api.catalogs.get();
      if (response.error) {
        throw new Error(
          typeof response.error.value === "string"
            ? response.error.value
            : JSON.stringify(response.error.value)
        );
      }
      return response.data as SelectCatalogWithParticipantCount[];
    },
  });
