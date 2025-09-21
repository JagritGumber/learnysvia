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

  const deleteCatalog = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const response = await api.api.catalogs({ cid: id }).delete();
      if (response.error) {
        throw new Error(
          typeof response.error.value === "string"
            ? response.error.value
            : JSON.stringify(response.error.value)
        );
      }
      return response.data as SelectCatalog;
    },
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["catalogs"] });
      queryClient.invalidateQueries({ queryKey: ["catalogs", id] });
    },
  });

  return { createCatalog, deleteCatalog };
};
