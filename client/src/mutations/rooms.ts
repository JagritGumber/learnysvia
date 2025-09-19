import { api } from "@/utils/treaty";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateRoom } from "@/shared/types/room";
import toast from "react-hot-toast";

export const useRoomMutations = () => {
  const queryClient = useQueryClient();

  const deleteRoom = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const response = await api.api.rooms({ id }).delete();
      if (response.error) {
        throw new Error(
          typeof response.error.value === "string"
            ? response.error.value
            : JSON.stringify(response.error.value)
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });

  const createRoom = useMutation({
    mutationFn: async (data: CreateRoom) => {
      const response = await api.api.rooms.post(data);
      if (response.error) {
        throw new Error(
          typeof response.error.value === "string"
            ? response.error.value
            : JSON.stringify(response.error.value)
        );
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["rooms"] });
      toast.success("Successfully created Room");
    },
    onError: async () => {
      toast.error("Failed to create the Room");
    },
  });

  return { deleteRoom, createRoom };
};
