import { db } from "@/database/db";
import { room as roomTable, roomParticipant } from "@/database/schemas";
import { betterAuth } from "@/macros/better-auth";
import { auth } from "@/utils/auth";
import { eq } from "drizzle-orm";
import { Elysia } from "elysia";
import z from "zod";

const getRoomByCode = async (code: string) => {
  return (
    await db.select().from(roomTable).where(eq(roomTable.code, code)).limit(1)
  )[0];
};

const addRoomHost = async (roomId: string, hostId: string) => {
  return await db.insert(roomParticipant).values({
    roomId,
    userId: hostId,
    participantType: "authenticated",
    role: "host",
  });
};

const startRoomById = async (id: string) => {
  return await db
    .update(roomTable)
    .set({ status: "running" })
    .where(eq(roomTable.id, id))
    .returning();
};

const addRoomParticpant = async (
  roomId: string,
  name: string,
  anonymousId: string
) => {
  return await db.insert(roomParticipant).values({
    roomId,
    displayName: name,
    participantType: "anonymous",
    role: "participant",
    anonymousId: anonymousId,
  });
};

export const roomsWs = new Elysia({ name: "rooms", prefix: "/rooms" })
  .use(betterAuth)
  .ws("/:id", {
    message: async (ws, data) => {
      const session = await auth.api.getSession({
        headers: ws.data.request.headers,
      });

      if (data.event === "start") {
        // Check if user is authenticated
        if (!session) {
          ws.send({
            event: "error",
            message: "Authentication required to start room",
          });
          return;
        }

        const room = await getRoomByCode(data.code);

        if (!room) {
          ws.send({
            event: "error",
            message: "Room not found",
          });
          return;
        }

        await addRoomHost(room.id, session.user.id);

        await startRoomById(data.id);

        ws.send({
          event: "room_started",
          message: "Room started successfully",
        });
      }

      if (data.event === "join") {
        const room = await getRoomByCode(data.code);

        if (!room) {
          ws.send({
            event: "error",
            message: "Room not found",
          });
          return;
        }

        await addRoomParticpant(room.id, data.name, data.anonymousId);
        ws.send({
          event: "joined",
          message: "Joined room successfully",
        });
      }
    },
    body: z.union([
      z.object({
        event: z.literal("start"),
        code: z.string().min(1, "Code cannot be empty"),
        id: z.string().min(1, "ID cannot be empty"),
      }),
      z.object({
        event: z.literal("join"),
        code: z.string().min(1, "Code cannot be empty"),
        name: z.string().min(1, "Name cannot be empty"),
        anonymousId: z.string().min(1, "Anonymous ID cannot be empty"),
      }),
    ]),
    params: z.object({
      id: z.uuid(),
    }),
  });
