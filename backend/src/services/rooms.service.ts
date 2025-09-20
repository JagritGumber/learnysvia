import { db } from "@/database/db";
import * as t from "@/database/schemas";
import * as q from "drizzle-orm";
import { RoomStatus } from "../../../shared/types/room";

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
  )[0];
};

export const addRoomHost = async (roomId: string, hostId: string) => {
  return await db.insert(t.roomParticipant).values({
    roomId,
    userId: hostId,
    participantType: "authenticated",
    role: "host",
  });
};

export const startRoomById = async (id: string) => {
  return await db
    .update(t.room)
    .set({ status: "running" })
    .where(q.eq(t.room.id, id))
    .returning();
};

export const addRoomParticpant = async (
  roomId: string,
  name: string,
  anonymousId: string
) => {
  return await db.insert(t.roomParticipant).values({
    roomId,
    displayName: name,
    participantType: "anonymous",
    role: "participant",
    anonymousId: anonymousId,
  });
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
