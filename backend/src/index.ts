import { Elysia } from "elysia";
import { apiRouter } from "./routes/api";
import cors from "@elysiajs/cors";
import { env } from "@/env";
import { auth } from "./utils/auth";
import { websocketRouter } from "./routes/websocket";

const app = new Elysia()
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
  .use(websocketRouter)
  .mount(auth.handler)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
