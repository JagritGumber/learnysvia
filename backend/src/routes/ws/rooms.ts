import { betterAuth } from "@/macros/better-auth";
import {
  addRoomHost,
  addRoomParticpant,
  getRoomByIdentifier,
  startRoomById,
} from "@/services/rooms.service";
import { auth } from "@/utils/auth";
import { Elysia } from "elysia";
import z from "zod";

export const roomsWs = new Elysia({ name: "rooms", prefix: "/rooms" })
  .use(betterAuth)
  .ws("/", {
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

        const room = await getRoomByIdentifier(data.code);

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
        const room = await getRoomByIdentifier(data.code);

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
    response: z.union([
      z.object({
        event: z.enum(["error", "joined", "room_started"]),
        message: z.string(),
      }),
    ]),
    params: z.object({
      id: z.uuid(),
    }),
  });
