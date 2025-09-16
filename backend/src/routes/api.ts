import { boardsRouter } from "./boards";
import { usersRouter } from "./users";
import Elysia from "elysia";

export const apiRouter = new Elysia({ prefix: "/api" })
  .use(boardsRouter)
  .use(usersRouter);
