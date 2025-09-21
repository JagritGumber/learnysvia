import { usersRouter } from "./api/users";
import Elysia from "elysia";
import { roomsRouter } from "./api/rooms";
import { catalogsRouter } from "./api/catalogs";
import { db } from "@/database/db";

export const apiRouter = new Elysia({ prefix: "/api" })
  .use(usersRouter)
  .use(roomsRouter)
  .use(catalogsRouter)
  .get("/questions", async ({ status }) => {
    const questions = await db.query.questions.findMany();
    const catalogs = await db.query.catalogs.findMany();
    return status(200, { questions, catalogs });
  });
