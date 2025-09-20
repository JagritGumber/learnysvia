import { db } from "@/database/db";
import * as t from "@/database/schemas";
import * as q from "drizzle-orm";

export const getActiveRoomParticipants = async (roomId: string) => {
  return await db
    .select()
    .from(t.roomParticipant)
    .where(
      q.and(
        q.eq(t.roomParticipant, roomId),
        q.isNotNull(t.roomParticipant.wsId)
      )
    );
};
