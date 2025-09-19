import { betterAuth } from "@/macros/better-auth";
import { auth } from "@/utils/auth";
import { Elysia } from "elysia";
import z from "zod";

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

        // Check if start request comes with data
        if (!data.data) {
          ws.send({
            event: "error",
            message: "Start request must include data",
          });
          return;
        }

        // User is authenticated and data is provided, let the room start
        // TODO: Implement room start logic here
        ws.send({
          event: "room_started",
          message: "Room started successfully",
          data: data.data,
        });
      }
    },
    body: z.object({
      event: z.literal("start"),
      data: z.any().optional(), // Allow any data to be sent with start request
    }),
    params: z.object({
      id: z.uuid(),
    }),
  });
