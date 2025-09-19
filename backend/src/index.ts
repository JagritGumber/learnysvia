import { Elysia } from "elysia";
import { apiRouter } from "./routes/api";
import cors from "@elysiajs/cors";
import { env } from "@/env";
import { auth } from "./utils/auth";

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
  .mount(auth.handler)
  .listen(3000);

export type App = typeof app;

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
