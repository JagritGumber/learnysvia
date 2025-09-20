import { api } from "@/utils/treaty";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateRoom, SelectParticipant } from "@/shared/types/room";
import toast from "react-hot-toast";
import { useNavigate } from "@tanstack/react-router";

export const useRoomMutations = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

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

  const joinRoom = useMutation({
    mutationFn: async ({
      code,
      name,
      type,
    }: {
      code: string;
      name: string;
      type: "auth" | "anon";
    }) => {
      const response = await api.api.rooms.join.post({
        code,
        name,
        type,
      });
      if (response.error) {
        throw new Error(
          typeof response.error.value === "string"
            ? response.error.value
            : JSON.stringify(response.error.value)
        );
      }
      return response.data as SelectParticipant;
    },
    onSuccess: async (data, variables) => {
      toast.success("Successfully joined room");
      navigate({
        to: "/room/$id",
        params: { id: variables.code },
        search: { pid: data?.id, rid: data.roomId },
      });
    },
    onError: async (error) => {
      toast.error(error.message || "Failed to join room");
    },
  });

  const startRoom = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const response = await api.api.rooms.status.patch({
        id: id,
        status: "running",
      });
      if (response.error) {
        throw new Error(
          typeof response.error.value === "string"
            ? response.error.value
            : JSON.stringify(response.error.value)
        );
      }
    },
    onSuccess: async () => {
      toast.success("Test started successfully");
    },
    onError: async (error) => {
      toast.error(error.message || "Failed to start test");
    },
  });

  return { deleteRoom, createRoom, joinRoom, startRoom };
};
