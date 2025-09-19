import { createRoomSchema } from "../../backend/src/database/schemas";
import { z } from "zod";

export type CreateRoom = Pick<
  z.infer<typeof createRoomSchema>,
  "name" | "description" | "isPublic" | "maxParticipants"
>;
