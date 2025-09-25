import { usersRouter } from "./api/users";
import Elysia from "elysia";
import { roomsRouter } from "./api/rooms";
import { catalogsRouter } from "./api/catalogs";

export const apiRouter = new Elysia({ prefix: "/api" })
  .use(usersRouter)
  .use(roomsRouter)
  .use(catalogsRouter);
