import {
  createQuestionSchema,
  updateQuestionSchema,
} from "@/database/schemas/core";
import Elysia from "elysia";
import { betterAuth } from "@/macros/better-auth";
import z from "zod";
import {
  createCatalogQuestion,
  deleteCatalogQuestion,
  getCatalogQuestion,
  getCatalogQuestions,
  updateCatalogQuestion,
} from "@/services/questions.service";
import { catalogMacro } from "@/macros/catalog";

export const questionsRouter = new Elysia({ prefix: "/questions" })
  .use(betterAuth)
  .use(catalogMacro)
  .model({
    createQuestion: createQuestionSchema.pick({ text: true }),
    updateQuestion: updateQuestionSchema.pick({ text: true }),
  })
  .guard({
    auth: true,
    catalog: true,
    params: z.object({
      cid: z.string(),
    }),
  })
  .get("", async ({ params, user, status, catalog }) => {
    const { cid } = params;

    const catalogQuestions = await getCatalogQuestions({
      catalogId: cid,
      userId: user.id,
    });
    return status(200, {
      id: catalog.id,
      name: catalog.name,
      description: catalog.description,
      questions: catalogQuestions,
    });
  })

  .post(
    "",
    async ({ params, body }) => {
      const { cid } = params;
      const { text } = body;

      const newQuestion = createCatalogQuestion(cid, {
        text,
      });

      return {
        question: newQuestion,
      };
    },
    {
      body: "createQuestion",
    }
  )
  .group(
    "/:qid",
    {
      params: z.object({
        qid: z.string(),
      }),
    },
    (app) =>
      app
        .patch(
          "/",
          async ({ params, body }) => {
            const { qid } = params;
            const { text } = body;

            const updatedQuestion = await updateCatalogQuestion(qid, {
              text,
            });
            return {
              success: true,
              question: updatedQuestion,
            };
          },
          {
            body: "updateQuestion",
          }
        )
        .delete("/", async ({ params }) => {
          const { qid } = params;

          const deletedQuestion = await deleteCatalogQuestion(qid);
          return {
            success: true,
            question: deletedQuestion,
          };
        })
        .get("/", async ({ params }) => {
          const { qid } = params;
          const selectedQuestion = await getCatalogQuestion(qid);

          return {
            question: selectedQuestion,
          };
        })
  );
