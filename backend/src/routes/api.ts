import { lessonsRouter } from "./lessons";
import { usersRouter } from "./users";
import Elysia from "elysia";

export const apiRouter = new Elysia({ prefix: "/api" })
  .use(lessonsRouter)
  .use(usersRouter);
