import { betterAuth } from "@/macros/better-auth";
import {
  createRoomPoll,
  getRoomPollById,
  getRoomPolls,
  submitPollAnswer,
  getPollAnswers,
  hasUserAnsweredPoll,
  deleteRoomPoll,
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
      timeLimit: z.number().min(1).max(60).optional().default(1),
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
    async ({ status, params: { rid }, body: { questionId, timeLimit } }) => {
      try {
        const poll = await createRoomPoll(rid, { questionId, timeLimit });
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
      auth: true,
    },
    (app) =>
      app
        .get("/", ({ status, params: { pid, rid } }) => {
          try {
            const poll = getRoomPollById(rid, pid);
            return status(200, poll);
          } catch (e) {
            console.error("Internal server error while getting the poll", e);
            return status(500);
          }
        })
        .delete("/", async ({ status, params: { pid, rid } }) => {
          try {
            const deletedPoll = await deleteRoomPoll(rid, pid);
            return status(200, deletedPoll);
          } catch (e) {
            console.error("Internal server error while deleting the poll", e);
            if (e instanceof Error && e.message.includes("not found")) {
              return status(404, e.message);
            }
            return status(500, "Internal Server Error");
          }
        })
        .group("/answers", (answersApp) =>
          answersApp
            .post("/", async ({ status, params: { pid }, user, body }) => {
              try {
                const answer = await submitPollAnswer(pid, user.id, body.optionId);
                return status(201, answer);
              } catch (e) {
                console.error(
                  "Internal server error while submitting poll answer",
                  e
                );
                return status(500, "Internal Server Error");
              }
            }, {
              body: z.object({
                optionId: z.string(),
              }),
            })
            .get("/", async ({ status, params: { pid } }) => {
              try {
                const answers = await getPollAnswers(pid);
                return status(200, answers);
              } catch (e) {
                console.error(
                  "Internal server error while getting poll answers",
                  e
                );
                return status(500, "Internal Server Error");
              }
            })
            .get("/me", async ({ status, params: { pid }, user }) => {
              try {
                const hasAnswered = await hasUserAnsweredPoll(pid, user.id);
                return status(200, { hasAnswered });
              } catch (e) {
                console.error(
                  "Internal server error while checking if user answered poll",
                  e
                );
                return status(500, "Internal Server Error");
              }
            })
        )
  );
