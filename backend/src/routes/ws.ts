import Elysia from "elysia";
import { roomsWs } from "./ws/rooms";

export const wsRouter = new Elysia({
  name: "websocket",
  prefix: "/websocket",
}).use(roomsWs);
