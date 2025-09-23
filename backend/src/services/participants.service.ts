import { db } from "@/database/db";
import * as t from "@/database/schemas";
import * as q from "drizzle-orm";

export const getActiveRoomParticipants = async (roomId: string) => {
  return await db
    .select()
    .from(t.roomParticipant)
    .where(
      q.and(
        q.eq(t.roomParticipant.roomId, roomId),
        q.isNotNull(t.roomParticipant.wsId)
      )
    );
};

export const addWsIdForParticipant = async (
  participantId: string,
  wsId: string
) => {
  return (
    await db
      .update(t.roomParticipant)
      .set({
        wsId,
      })
      .where(q.eq(t.roomParticipant.id, participantId))
      .returning()
  )?.[0];
};

export const removeParticipant = async (participantId: string) => {
  return (
    await db
      .delete(t.roomParticipant)
      .where(q.eq(t.roomParticipant.id, participantId))
      .returning()
  )?.[0];
};

export const cleanupAnonymousUser = async (userId: string) => {
  try {
    await db
      .delete(t.user)
      .where(q.eq(t.user.id, userId));
  } catch (error) {
    console.error("Failed to delete anonymous user:", error);
  }
};
