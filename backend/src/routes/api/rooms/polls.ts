import { betterAuth } from "@/macros/better-auth";
import { getRoomPolls } from "@/services/polls.service";
import { Elysia } from "elysia";
import z from "zod";

export const pollsRouter = new Elysia({
  prefix: "/polls",
})
  .use(betterAuth)
  .guard({
    auth: true,
    params: z.object({
      rid: z.string(),
    }),
  })
  .get("/", async ({ status, params: { rid } }) => {
    try {
      const polls = await getRoomPolls(rid);
      return status(200, polls);
    } catch (e) {
      console.error("Internal server error while trying to get the polls", e);
      return status(500, "Internal Server Error");
    }
  });
