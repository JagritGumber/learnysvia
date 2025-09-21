import { usersRouter } from "./api/users";
import { pollsRouter } from "./api/polls";
import Elysia from "elysia";
import { roomsRouter } from "./api/rooms";
import { catalogsRouter } from "./api/catalogs";

export const apiRouter = new Elysia({ prefix: "/api" })
  .use(catalogsRouter)
  .use(usersRouter)
  .use(pollsRouter)
  .use(roomsRouter);
