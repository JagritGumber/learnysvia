import { auth } from "@/utils/auth";
import Elysia from "elysia";

export const apiRouter = new Elysia({ prefix: "/api" }).mount(auth.handler);
