import { db } from "@/database/db";
import * as t from "@/database/schemas";
import * as q from "drizzle-orm";

/**
 * Parse duration string like "60m", "30m", "2h" into minutes
 */
const parseDurationToMinutes = (duration: string): number => {
  const match = duration.match(/^(\d+)([mh])$/);
  if (!match) return 60; // default to 60 minutes

  const value = parseInt(match[1]);
  const unit = match[2];

  if (unit === 'h') {
    return value * 60; // convert hours to minutes
  }

  return value; // already in minutes
};

/**
 * Get rooms that should be closed due to host timeout
 */
export const getRoomsToClose = async () => {
  const now = new Date();

  // Find rooms where:
  // 1. Status is "running"
  // 2. Host has left (no active participants with role "host")
  // 3. Host left at a specific time (hostLeftAt is not null)
  // 4. Time since host left exceeds room duration
  const roomsToClose = await db
    .select({
      id: t.room.id,
      code: t.room.code,
      name: t.room.name,
      duration: t.room.duration,
      hostLeftAt: t.room.hostLeftAt,
      createdAt: t.room.createdAt,
      updatedAt: t.room.updatedAt,
    })
    .from(t.room)
    .leftJoin(
      t.roomParticipant,
      q.and(
        q.eq(t.room.id, t.roomParticipant.roomId),
        q.eq(t.roomParticipant.role, "host"),
        q.isNotNull(t.roomParticipant.wsId)
      )
    )
    .where(
      q.and(
        q.eq(t.room.status, "running"),
        q.isNull(t.roomParticipant.id), // No active host
        q.isNotNull(t.room.hostLeftAt) // Host has left at a specific time
      )
    )
    .groupBy(t.room.id);

  // Filter rooms where the timeout has been exceeded
  return roomsToClose.filter(room => {
    if (!room.hostLeftAt) return false;

    const durationMinutes = parseDurationToMinutes(room.duration);
    const timeoutTime = new Date(room.hostLeftAt.getTime() + (durationMinutes * 60 * 1000));

    return now > timeoutTime;
  });
};

/**
 * Close rooms that have timed out
 */
export const closeTimedOutRooms = async () => {
  const roomsToClose = await getRoomsToClose();

  if (roomsToClose.length === 0) {
    return { closed: 0, rooms: [] };
  }

  const closedRooms = [];

  for (const room of roomsToClose) {
    try {
      await db
        .update(t.room)
        .set({
          status: "ended",
          updatedAt: new Date()
        })
        .where(q.eq(t.room.id, room.id));

      closedRooms.push(room);
    } catch (error) {
      console.error(`Failed to close room ${room.id}:`, error);
    }
  }

  return {
    closed: closedRooms.length,
    rooms: closedRooms
  };
};
