import { Elysia } from "elysia";
import { eq, and, desc } from "drizzle-orm";
import { db } from "../../database/db";
import {
  createRoomSchema,
  room,
  roomParticipant,
  updateRoomSchema,
} from "../../database/schemas";
import { user as userTable } from "../../database/schemas/auth/user";
import { betterAuth } from "../../macros/better-auth";
import z from "zod";
import { env } from "@/env";

// Generate unique room code
function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export const roomsRouter = new Elysia({ prefix: "/rooms" })
  .use(betterAuth)
  .model({
    createRoom: createRoomSchema.pick({
      maxParticipants: true,
      description: true,
      isPublic: true,
      name: true,
      duration: true,
    }),
    updateRoom: updateRoomSchema,
  })
  .guard({
    auth: true,
  })
  // Create room
  .post(
    "/",
    async ({ body, status, user }) => {
      let roomCode: string;
      let attempts = 0;
      const maxAttempts = 10;
      do {
        roomCode = generateRoomCode();
        attempts++;
      } while (
        attempts < maxAttempts &&
        (await db.select().from(room).where(eq(room.code, roomCode))).length > 0
      );

      if (attempts >= maxAttempts) {
        return status(500, "Failed to generate unique room code");
      }
      try {
        // Create room
        const newRoom = await db
          .insert(room)
          .values({
            code: roomCode,
            name: body.name,
            description: body.description,
            createdBy: user.id,
            isPublic: body.isPublic ?? true,
            maxParticipants: body.maxParticipants ?? 50,
            duration: body.duration ?? "60m",
          })
          .returning();

        return status(200, {
          room: newRoom[0],
          code: roomCode,
          shareUrl: `${env.CLIENT_URL}/join/${roomCode}`,
        });
      } catch (error) {
        console.error("Failed to create room:", error);
        return status(500, "Failed to create room");
      }
    },
    {
      body: "createRoom",
    }
  )
  // Get user's rooms
  .get("/", async ({ status, user }) => {
    try {
      const userRooms = await db
        .select()
        .from(room)
        .where(eq(room.createdBy, user.id))
        .orderBy(desc(room.createdAt));
      return status(200, {
        rooms: userRooms,
      });
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
      return status(500, "Failed to fetch rooms");
    }
  })
  .group(
    "/:id",
    {
      params: z.object({ id: z.uuid() }),
    },
    (app) =>
      app
        .get("/", async ({ params: { id }, status, user }) => {
          try {
            const roomData = await db
              .select()
              .from(room)
              .where(and(eq(room.id, id), eq(room.createdBy, user.id)))
              .limit(1);

            if (roomData.length === 0) {
              return status(404, "Room not found");
            }

            const participants = await db
              .select({
                id: roomParticipant.id,
                roomId: roomParticipant.roomId,
                userId: roomParticipant.userId,
                joinedAt: roomParticipant.createdAt,
                userName: userTable.name,
                userEmail: userTable.email,
              })
              .from(roomParticipant)
              .leftJoin(userTable, eq(roomParticipant.userId, userTable.id))
              .where(eq(roomParticipant.roomId, id));

            return status(200, {
              room: roomData[0],
              participants,
              count: participants.length,
            });
          } catch (error) {
            console.error("Failed to fetch room:", error);
            return status(500, "Failed to fetch room");
          }
        })
        .put(
          "/",
          async ({ params: { id }, body, status, user }) => {
            try {
              // Check if user owns the room
              const roomData = await db
                .select()
                .from(room)
                .where(and(eq(room.id, id), eq(room.createdBy, user.id)))
                .limit(1);

              if (roomData.length === 0) {
                return status(404, "Room not found or access denied");
              }

              const updatedRoom = await db
                .update(room)
                .set(body)
                .where(eq(room.id, id))
                .returning();

              return { room: updatedRoom[0] };
            } catch (error) {
              console.error("Failed to update room:", error);
              return status(500, "Failed to update room");
            }
          },
          {
            body: "updateRoom",
          }
        )
        .delete("/", async ({ params: { id }, status, user }) => {
          try {
            // Check if user owns the room
            const roomData = await db
              .select()
              .from(room)
              .where(and(eq(room.id, id), eq(room.createdBy, user.id)))
              .limit(1);

            if (roomData.length === 0) {
              return status(404, "Room not found or access denied");
            }
            await db
              .delete(roomParticipant)
              .where(eq(roomParticipant.roomId, id));
            await db.delete(room).where(eq(room.id, id));

            return status(204);
          } catch (error) {
            console.error("Failed to delete room:", error);
            return status(500, "Failed to delete room");
          }
        })
  );
