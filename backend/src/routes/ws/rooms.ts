import {
  selectPollSchema,
  selectRoomParticipantSchema,
} from "@/database/schemas";
import {
  addWsIdForParticipant,
  getActiveRoomParticipants,
  removeParticipant,
  cleanupAnonymousUser,
} from "@/services/participants.service";
import {
  getRoomByIdentifierWithParticipantCount,
  updateRoomStatusByIdentifier,
  markHostAsLeft,
} from "@/services/rooms.service";
import { getNewlyCreatedPoll, getRoomPolls } from "@/services/polls.service";
import { Elysia } from "elysia";
import z from "zod";
import { app } from "@/index";

export const roomsWs = new Elysia({ name: "rooms" }).ws("/rooms/:id/:pid", {
  body: z.union([
    z.object({
      event: z.literal("participants:get"),
      roomId: z.string(),
    }),
    z.object({
      event: z.literal("poll:get"),
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
      event: z.literal("polls:result"),
      polls: z.array(selectPollSchema),
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
    z.object({
      event: z.literal("poll:result"),
      poll: selectPollSchema.nullable(),
    }),
    z.object({
      event: z.literal("redirect:join"),
      code: z.string(),
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

    ws.subscribe(`room_${ws.data.params.id}`);
    if (!room) {
      ws.send({
        event: "error",
        message: "There is no room with this code",
      });
      ws.close();
    }
    const participant = await addWsIdForParticipant(ws.data.params.pid, ws.id);
    if (!participant) {
      ws.send({
        event: "redirect:join",
        code: room.code,
      });
      return;
    }

    ws.send({
      event: "participant:updated",
      participant,
    });
    app.server?.publish(`room_${ws.data.params.id}`, "participants:notfresh");
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

    // If the leaving participant is the host, mark the host as left
    if (participant?.role === "host") {
      await markHostAsLeft(room.id);
    }

    // Delete anonymous users from auth system when they disconnect
    if (participant?.participantType === "anonymous" && participant?.userId) {
      await cleanupAnonymousUser(participant.userId);
    }

    ws.send({
      event: "participant:removed",
    });
    app.server?.publish(`room_${ws.data.params.id}`, "participants:notfresh");
  },
  message: async (ws, data) => {
    if (data.event === "participants:get") {
      const participants = await getActiveRoomParticipants(data.roomId);
      ws.send({
        event: "participants:result",
        participants,
        message: "Successfully fetched participants",
      });
      app.server?.publish(`room_${ws.data.params.id}`, "participants:fresh");
    } else if (data.event === "poll:get") {
      const poll = await getNewlyCreatedPoll(data.roomId);
      ws.send({
        event: "poll:result",
        poll,
      });
    }
  },
});
