import { CreateCatalog } from "@/shared/types/catalog";
import { SelectCatalog } from "@/shared/types/room";
import { api } from "@/utils/treaty";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCatalogMutations = () => {
  const queryClient = useQueryClient();

  const createCatalog = useMutation({
    mutationFn: async ({ name, description }: CreateCatalog) => {
      const response = await api.api.catalogs.post({
        name,
        description,
      });
      if (response.error) {
        throw new Error(
          typeof response.error.value === "string"
            ? response.error.value
            : JSON.stringify(response.error.value)
        );
      }
      return response.data as SelectCatalog;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalogs"] });
    },
  });

  return { createCatalog };
};
