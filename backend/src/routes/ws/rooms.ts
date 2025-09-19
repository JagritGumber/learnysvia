import { Elysia } from "elysia";
import z from "zod";

export const roomsWs = new Elysia({ name: "rooms", prefix: "/rooms" }).ws(
  "/:id",
  {
    message: async (ws, data) => {
      if (data.event === "start") {
      }
    },
    body: z.object({
      event: z.literal("start"),
    }),
    params: z.object({
      id: z.uuid(),
    }),
  }
);
