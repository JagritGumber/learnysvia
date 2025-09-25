import { Elysia } from "elysia";
import { apiRouter } from "./routes/api";
import cors from "@elysiajs/cors";
import { env } from "@/env";
import { auth } from "./utils/auth";
import { wsRouter } from "./routes/ws";
import { cron } from "@elysiajs/cron";
import { closeTimedOutRooms } from "./services/room-cleanup.service";
import { stripPrefixFromCookie } from "./utils/stripPrefix";

export const app = new Elysia({
  precompile: true,
})
  .use(
    cors({
      origin: env.CLIENT_URL,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
      allowedHeaders: ["content-type", "authorization", "cookie", "set-cookie"],
    })
  )
  .get("/", () => "Hello Elysia")
  .use(apiRouter)
  .use(wsRouter)
  .mount("/api/auth", async (r) => {
    const cookieHeader = r.headers.get("cookie");
    let newReq = r;

    if (cookieHeader) {
      const rewrittenCookie = stripPrefixFromCookie(cookieHeader);
      if (rewrittenCookie !== cookieHeader) {
        // clone the request with new headers
        const newHeaders = new Headers(r.headers);
        newHeaders.set("cookie", rewrittenCookie);

        newReq = new Request(r.url, {
          method: r.method,
          headers: newHeaders,
          body: r.body, // works for most requests; for streams you may need r.clone()
          redirect: r.redirect,
        });

        console.log("[cookieRewrite] Rewrote cookie:", rewrittenCookie);
      }
    }
    return auth.handler(newReq);
  })
  .use(
    cron({
      name: "room-cleanup",
      pattern: "*/1 * * * *", // Every minute
      run: async () => {
        try {
          const result = await closeTimedOutRooms();
          if (result.closed > 0) {
            console.log(
              `🧹 Room cleanup: Closed ${result.closed} timed out rooms`
            );
            result.rooms.forEach((room) => {
              console.log(`   - Closed room "${room.name}" (${room.code})`);
            });
          }
        } catch (error) {
          console.error("❌ Room cleanup failed:", error);
        }
      },
    })
  )
  .listen(8080);

export type App = typeof app;

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
