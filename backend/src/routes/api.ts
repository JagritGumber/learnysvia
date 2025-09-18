import { usersRouter } from "./users";
import { pollsRouter } from "./polls";
import Elysia from "elysia";
import { roomsRouter } from "./rooms";

export const apiRouter = new Elysia({ prefix: "/api" })
  .use(usersRouter)
  .use(pollsRouter)
  .use(roomsRouter);
