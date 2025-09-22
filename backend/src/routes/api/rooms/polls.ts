import { betterAuth } from "@/macros/better-auth";
import { createRoomPoll, getRoomPolls } from "@/services/polls.service";
import { Elysia } from "elysia";
import z from "zod";

export const pollsRouter = new Elysia({
  prefix: "/polls",
})
  .use(betterAuth)
  .model({
    createPoll: z.object({
      questionId: z.string(),
    }),
  })
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
  })
  .post(
    "/",
    async ({ status, params: { rid }, body: { questionId } }) => {
      try {
        const poll = await createRoomPoll(rid, { questionId });
        return status(201, poll);
      } catch (e) {
        console.error("Internal server error while creating a poll", e);
        return status(500, "Internal Server Error");
      }
    },
    {
      body: "createPoll",
    }
  );
