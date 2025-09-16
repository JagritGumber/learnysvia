import { schoolsRouter } from "./schools";
import { usersRouter } from "./users";
import Elysia from "elysia";

export const apiRouter = new Elysia({ prefix: "/api" })
  .use(schoolsRouter)
  .use(usersRouter);
