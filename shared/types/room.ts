import {
  createRoomSchema,
  selectCatalogSchema,
  selectRoomParticipantSchema,
  updateRoomSchema,
} from "../../backend/src/database/schemas";
import { z } from "zod";

export type CreateRoom = Pick<
  z.infer<typeof createRoomSchema>,
  "name" | "description" | "isPublic" | "maxParticipants" | "duration"
>;

export type SelectRoom = z.infer<typeof updateRoomSchema>;

export type RoomStatus = Required<SelectRoom>["status"];

export type SelectParticipant = z.infer<typeof selectRoomParticipantSchema>;

export type SelectCatalog = z.infer<typeof selectCatalogSchema>;

export type SelectCatalogWithParticipantCount = Omit<
  SelectCatalog,
  "userId"
> & {
  questionCount: number;
};

