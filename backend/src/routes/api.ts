import { auth } from "@/utils/auth";
import { lessonsRouter } from "./lessons";
import Elysia from "elysia";

export const apiRouter = new Elysia({ prefix: "/api" })
  .mount(auth.handler)
  .use(lessonsRouter);
