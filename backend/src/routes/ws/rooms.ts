import { selectRoomParticipantSchema } from "@/database/schemas";
import {
  addWsIdForParticipant,
  getActiveRoomParticipants,
  removeParticipant,
} from "@/services/participants.service";
import { getRoomByIdentifierWithParticipantCount } from "@/services/rooms.service";
import { Elysia } from "elysia";
import z from "zod";

export const roomsWs = new Elysia({ name: "rooms" }).ws("/rooms/:id/:pid", {
  body: z.union([
    z.object({
      event: z.literal("participants:get"),
      roomId: z.string(),
    }),
  ]),
  response: z.union([
    z.object({
      event: z.literal("participants:result"),
      participants: z.array(selectRoomParticipantSchema),
      message: z.string(),
    }),
    z.object({
      event: z.literal("error"),
      message: z.string(),
    }),
    z.object({
      event: z.literal("participant:updated"),
      participant: selectRoomParticipantSchema,
    }),
    z.object({
      event: z.literal("participant:removed"),
    }),
  ]),
  params: z.object({
    id: z.string(),
    pid: z.string(),
  }),
  open: async (ws) => {
    const room = await getRoomByIdentifierWithParticipantCount(
      ws.data.params.id
    );
    if (!room) {
      ws.send({
        event: "error",
        message: "There is no room with this code",
      });
      ws.close();
    }
    const participant = await addWsIdForParticipant(ws.data.params.pid, ws.id);
    ws.send({
      event: "participant:updated",
      participant,
    });
  },
  close: async (ws) => {
    const room = await getRoomByIdentifierWithParticipantCount(
      ws.data.params.id
    );
    if (!room) {
      ws.send({
        event: "error",
        message: "There is no room with this code",
      });
      ws.close();
    }
    const participant = await removeParticipant(ws.data.params.pid);
    ws.send({
      event: "participant:removed",
    });
  },
  message: async (ws, data) => {
    if (data.event === "participants:get") {
      const participants = await getActiveRoomParticipants(data.roomId);
      ws.send({
        event: "participants:result",
        participants,
        message: "Successfully fetched participants",
      });
    }
  },
});
