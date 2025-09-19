import { usersRouter } from "./api/users";
import { pollsRouter } from "./api/polls";
import Elysia from "elysia";
import { roomsRouter } from "./api/rooms";

export const apiRouter = new Elysia({ prefix: "/api" })
  .use(usersRouter)
  .use(pollsRouter)
  .use(roomsRouter);
