import {
  createRoomSchema,
  updateRoomSchema,
} from "../../backend/src/database/schemas";
import { z } from "zod";

export type CreateRoom = Pick<
  z.infer<typeof createRoomSchema>,
  "name" | "description" | "isPublic" | "maxParticipants" | "duration"
>;

export type SelectRoom = z.infer<typeof updateRoomSchema>;

export type RoomStatus = Required<SelectRoom>["status"];
