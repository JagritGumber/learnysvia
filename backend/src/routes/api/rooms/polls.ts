import { betterAuth } from "@/macros/better-auth";
import {
  createRoomPoll,
  getRoomPollById,
  getRoomPolls,
} from "@/services/polls.service";
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
  )
  .group(
    "/:pid",
    {
      params: z.object({
        pid: z.string(),
      }),
    },
    (app) =>
      app.get("/", ({ status, params: { pid, rid } }) => {
        try {
          const poll = getRoomPollById(rid, pid);
          return status(200, poll);
        } catch (e) {
          console.error("Internal server error while getting the poll", e);
          return status(500);
        }
      })
  );
