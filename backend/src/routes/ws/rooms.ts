import { getActiveRoomParticipants } from "@/services/participants.service";
import { getRoomByIdentifierWithParticipantCount } from "@/services/rooms.service";
import { Elysia } from "elysia";
import z from "zod";

export const roomsWs = new Elysia({ name: "rooms" }).ws("/rooms/:id", {
  body: z.union([
    z.object({
      event: z.literal("participants:get"),
      roomId: z.string(),
    }),
  ]),
  response: z.union([
    z.object({
      event: z.literal("participant:result"),
      participants: z.array(
        z.object({
          id: z.string(),
          roomId: z.string(),
          userId: z.string().nullable(),
          anonymousId: z.string().nullable(),
          wsId: z.string().nullable(),
          displayName: z.string().nullable(),
          participantType: z.enum(["authenticated", "anonymous"]),
          role: z.enum(["host", "co_host", "participant"]).nullable(),
          createdAt: z.date(),
        })
      ),
      message: z.string(),
    }),
    z.object({
      event: z.literal("error"),
      message: z.string(),
    }),
  ]),
  params: z.object({
    id: z.string(),
  }),
  open: async (ws) => {
    const room = await getRoomByIdentifierWithParticipantCount(
      ws.data.query.id
    );
    if (!room) {
      ws.send({
        event: "error",
        message: "There is no room with this code",
      });
      ws.close();
    }
  },
  message: async (ws, data) => {
    if (data.event === "participants:get") {
      const participants = await getActiveRoomParticipants(data.roomId);
      ws.send({
        event: "participant:result",
        participants,
        message: "Successfully fetched participants",
      });
    }
  },
});
