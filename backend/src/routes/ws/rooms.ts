import { getRoomByIdentifierWithParticipantCount } from "@/services/rooms.service";
import { Elysia } from "elysia";
import z from "zod";

export const roomsWs = new Elysia({ name: "rooms" }).ws("/rooms/:id", {
  body: z.union([
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
    ws.send({
      event: "error",
      message: JSON.stringify(ws.data.query),
    });
  },
});
