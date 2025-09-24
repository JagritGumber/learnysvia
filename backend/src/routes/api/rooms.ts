import { Elysia } from "elysia";
import { eq, and, desc } from "drizzle-orm";
import { db } from "../../database/db";
import {
  createRoomSchema,
  room,
  roomParticipant,
  updateRoomSchema,
} from "../../database/schemas";
import { betterAuth } from "../../macros/better-auth";
import z from "zod";
import { env } from "@/env";
import {
  addRoomHost,
  addRoomParticipant,
  getRoomByIdentifier,
  getRoomByIdentifierWithParticipantCount,
  startRoomById,
  updateUserName,
} from "@/services/rooms.service";
import {
  getActiveRoomParticipants,
  removeParticipant,
} from "@/services/participants.service";
import { pollsRouter } from "./rooms/polls";

// Generate unique room code
function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

const updateRoomStatusSchema = z.object({
  status: updateRoomSchema
    .pick({
      status: true,
    })
    .shape.status.nonoptional(),
  id: z.string(),
});

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
    updateRoomStatus: updateRoomStatusSchema,
  })
  .guard({
    auth: true,
  })
  .post(
    "/join",
    async ({ body, status, user }) => {
      try {
        // Find room by code
        const roomInfo = await getRoomByIdentifierWithParticipantCount(
          body.code
        );
        if (!roomInfo) {
          return status(404, "Room not found");
        }

        if (roomInfo.participantCount >= (roomInfo.maxParticipants || 50)) {
          return status(409, "Room is full");
        }

        if (body.type === "anon") {
          if (roomInfo.status === "ended" || roomInfo.status === "not_started")
            return status(400, "Room is not running");

          // Update the user's name in the auth system
          await updateUserName(user.id, body.name);

          const participant = await addRoomParticipant(roomInfo.id, {
            type: "anon",
            name: body.name,
            userId: user.id,
          });
          return status(201, participant);
        }

        // Either user is authenticated and is the host (start the room)
        if (body.type === "auth") {
          if (roomInfo.status === "ended") return status(400, "Room has ended");

          if (roomInfo.status === "not_started") {
            await startRoomById(roomInfo.id);
          }

          // if is not room host
          if (roomInfo.createdBy !== user.id) {
            const participant = await addRoomParticipant(roomInfo.id, {
              type: "auth",
              name: user.name,
              userId: user.id,
            });
            return status(201, participant);
          }
          const participant = await addRoomHost(
            roomInfo.id,
            user.id,
            user.name
          );
          return status(201, participant);
        }

        return status(400, "Bad Request");
      } catch (error) {
        console.error("Failed to join room:", error);
        return status(500, "Failed to join room");
      }
    },
    {
      body: z.union([
        z.object({
          type: z.literal("anon"),
          code: z.string(),
          name: z.string(),
        }),
        z.object({
          type: z.literal("auth"),
          code: z.string(),
        }),
      ]),
    }
  )
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
  .patch(
    "/status",
    async ({ status, body }) => {
      try {
        const room = await getRoomByIdentifier(body.id);

        if (room.status === "not_started") {
          if (body.status !== "running") {
            return status(
              400,
              `Test status: not_started is not updatable to ${body.status}, allowed type is "running"`
            );
          }
          // Start the test
          const [startedRoom] = await startRoomById(room.id);
          if (!startedRoom) {
            throw new Error("Unable to start the server");
          }
          return status(204);
        }
      } catch (e) {
        console.error("Failed to join the room", e);
        return status(500);
      }
    },
    {
      body: "updateRoomStatus",
    }
  )
  .group(
    "/:rid",
    {
      params: z.object({ rid: z.string() }),
    },
    (app) =>
      app
        .get("/", async ({ params: { rid }, status }) => {
          try {
            const roomData = await getRoomByIdentifierWithParticipantCount(rid);

            if (!roomData) {
              return status(404, "Room not found");
            }

            // Get participants for this room
            const participants = await getActiveRoomParticipants(rid);

            return status(200, {
              room: {
                ...roomData,
                participants,
              },
            });
          } catch (error) {
            console.error("Failed to fetch room:", error);
            return status(500, "Failed to fetch room");
          }
        })
        .put(
          "/",
          async ({ params: { rid }, body, status, user }) => {
            try {
              // Check if user owns the room
              const roomData = await db
                .select()
                .from(room)
                .where(and(eq(room.id, rid), eq(room.createdBy, user.id)))
                .limit(1);

              if (roomData.length === 0) {
                return status(404, "Room not found or access denied");
              }

              const updatedRoom = await db
                .update(room)
                .set(body)
                .where(eq(room.id, rid))
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
        .delete("/", async ({ params: { rid }, status, user }) => {
          try {
            // Check if user owns the room
            const roomData = await db
              .select()
              .from(room)
              .where(and(eq(room.id, rid), eq(room.createdBy, user.id)))
              .limit(1);

            if (roomData.length === 0) {
              return status(404, "Room not found or access denied");
            }
            await db
              .delete(roomParticipant)
              .where(eq(roomParticipant.roomId, rid));
            await db.delete(room).where(eq(room.id, rid));

            return status(204);
          } catch (error) {
            console.error("Failed to delete room:", error);
            return status(500, "Failed to delete room");
          }
        })
        .use(pollsRouter)
  );
