import { api } from "@/utils/treaty";
import { useQuery } from "@tanstack/react-query";

export const useRooms = () =>
  useQuery({
    queryKey: ["rooms"],
    queryFn: async () => {
      const rooms = await api.api.rooms.get();
      if (rooms.error) {
        throw new Error(rooms.error.value);
      }
      return rooms.data.rooms;
    },
  });
