import { db } from "@/database/db";
import * as t from "@/database/schemas";
import * as q from "drizzle-orm";
import { RoomStatus } from "@/shared/types/room";

/**
 * Select the room from the database based on it's id or unique identifier code
 * @param codeOrId This could either be the unique code for the room or the id of the room
 * @returns The room that it found, could also be undefined
 */
export const getRoomByIdentifier = async (codeOrId: string) => {
  return (
    await db
      .select()
      .from(t.room)
      .where(q.or(q.eq(t.room.code, codeOrId), q.eq(t.room.id, codeOrId)))
      .limit(1)
  )?.[0];
};

export const getRoomByIdentifierWithParticipantCount = async (
  codeOrId: string
) => {
  return (
    await db
      .select({
        id: t.room.id,
        code: t.room.code,
        name: t.room.name,
        description: t.room.description,
        createdBy: t.room.createdBy,
        createdAt: t.room.createdAt,
        isPublic: t.room.isPublic,
        status: t.room.status,
        maxParticipants: t.room.maxParticipants,
        duration: t.room.duration,
        updatedAt: t.room.updatedAt,
        participantCount: q.count(t.roomParticipant.wsId),
      })
      .from(t.room)
      .leftJoin(t.roomParticipant, q.eq(t.room.id, t.roomParticipant.roomId))
      .where(q.or(q.eq(t.room.code, codeOrId), q.eq(t.room.id, codeOrId)))
      .groupBy(t.room.id)
      .limit(1)
  )?.[0];
};

export const addRoomHost = async (
  roomId: string,
  hostId: string,
  name: string
) => {
  return (
    await db
      .insert(t.roomParticipant)
      .values({
        roomId,
        userId: hostId,
        displayName: name,
        participantType: "authenticated",
        role: "host",
      })
      .returning()
  )?.[0];
};

export const startRoomById = async (id: string) => {
  return await db
    .update(t.room)
    .set({ status: "running" })
    .where(q.eq(t.room.id, id))
    .returning();
};

export const addRoomParticipant = async (
  roomId: string,
  data: { type: "anon" | "auth"; name: string; userId: string }
) => {
  const existingUser = await db
    .select()
    .from(t.roomParticipant)
    .where(q.eq(t.roomParticipant.userId, data.userId));

  if (existingUser.length > 0 && existingUser?.[0]) {
    throw new Error("Participant already in the room");
  }

  return (
    await db
      .insert(t.roomParticipant)
      .values({
        roomId,
        displayName: data.name,
        participantType: data.type === "anon" ? "anonymous" : "authenticated",
        role: "participant",
        userId: data.userId,
      })
      .returning()
  )?.[0];
};

export const updateRoomStatusByIdentifier = async (
  codeOrId: string,
  status: RoomStatus
) => {
  return await db
    .update(t.room)
    .set({
      status,
    })
    .where(q.or(q.eq(t.room.id, codeOrId), q.eq(t.room.code, codeOrId)))
    .returning();
};
