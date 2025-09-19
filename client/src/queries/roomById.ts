import { api } from "@/utils/treaty";
import { useQuery } from "@tanstack/react-query";

export const useRoomById = (roomId: string) =>
  useQuery({
    queryKey: ["room", roomId],
    queryFn: async () => {
      const response = await api.api.rooms({ id: roomId }).get();
      if (response.error) {
        throw new Error(
          typeof response.error.value === "string"
            ? response.error.value
            : JSON.stringify(response.error.value)
        );
      }
      return response.data;
    },
  });
