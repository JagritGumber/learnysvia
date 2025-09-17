import { usersRouter } from "./users";
import Elysia from "elysia";

export const apiRouter = new Elysia({ prefix: "/api" })
  .use(usersRouter);
