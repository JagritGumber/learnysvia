import Elysia from "elysia";
import { roomsWs } from "./ws/rooms";

export const wsRouter = new Elysia({ name: "websocket", prefix: "/ws" }).use(
  roomsWs
);
