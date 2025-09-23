import { Elysia } from "elysia";
import { apiRouter } from "./routes/api";
import cors from "@elysiajs/cors";
import { env } from "@/env";
import { auth } from "./utils/auth";
import { wsRouter } from "./routes/ws";
import { cron } from "@elysiajs/cron";
import { closeTimedOutRooms } from "./services/room-cleanup.service";

export const app = new Elysia({
  precompile: true,
})
  .get("/", () => "Hello Elysia")
  .use(
    cors({
      origin: env.CLIENT_URL,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  )
  .use(apiRouter)
  .use(wsRouter)
  .mount(auth.handler)
  .use(
    cron({
      name: "room-cleanup",
      pattern: "*/1 * * * *", // Every minute
      run: async () => {
        try {
          const result = await closeTimedOutRooms();
          if (result.closed > 0) {
            console.log(`🧹 Room cleanup: Closed ${result.closed} timed out rooms`);
            result.rooms.forEach(room => {
              console.log(`   - Closed room "${room.name}" (${room.code})`);
            });
          }
        } catch (error) {
          console.error("❌ Room cleanup failed:", error);
        }
      },
    })
  )
  .listen(3000);

export type App = typeof app;

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
