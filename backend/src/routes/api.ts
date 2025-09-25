import { usersRouter } from "./api/users";
import Elysia from "elysia";
import { roomsRouter } from "./api/rooms";
import { catalogsRouter } from "./api/catalogs";
import { authRouter } from "./api/auth";
import { db } from "@/database/db";

export const apiRouter = new Elysia({ prefix: "/api" })
  .use(usersRouter)
  .use(roomsRouter)
  .use(catalogsRouter)
  .use(authRouter);
