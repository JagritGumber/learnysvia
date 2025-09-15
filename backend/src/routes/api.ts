import { lessonsRouter } from "./lessons";
import Elysia from "elysia";

export const apiRouter = new Elysia({ prefix: "/api" }).use(lessonsRouter);
