import {
  createQuestionSchema,
  updateQuestionSchema,
} from "@/database/schemas/core";
import Elysia from "elysia";
import { betterAuth } from "@/macros/better-auth";
import z from "zod";
import {
  createCatalogQuestion,
  getCatalogQuestions,
  updateCatalogQuestion,
} from "@/services/questions.service";
import { catalogMacro } from "@/macros/catalog";

export const questionsRouter = new Elysia({ prefix: "/questions" })
  .use(betterAuth)
  .use(catalogMacro)
  .model({
    createQuestion: createQuestionSchema.pick({ title: true, content: true }),
    updateQuestion: updateQuestionSchema.pick({ title: true, content: true }),
  })
  .guard({
    auth: true,
    catalog: true,
    params: z.object({
      cid: z.string(),
    }),
  })
  .get("", async ({ params, user }) => {
    const { cid } = params;

    const catalogQuestions = await getCatalogQuestions({
      catalogId: cid,
      userId: user.id,
    });
    return {
      success: true,
      questions: catalogQuestions,
    };
  })

  .post(
    "",
    async ({ params, body }) => {
      const { cid } = params;
      const { title, content } = body;

      const newQuestion = createCatalogQuestion(cid, {
        title,
        content,
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
      app.patch(
        "/",
        async ({ params, body }) => {
          const { qid } = params;
          const { title, content } = body;

          const updatedQuestion = await updateCatalogQuestion(qid, {
            title,
            content,
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
  );

// .delete("/questions", async ({ params, user }) => {
//   const { id } = params;
//   const catalog = await db
//     .select()
//     .from(catalogs)
//     .innerJoin(questions, eq(questions.catalogId, catalogs.id))
//     .where(and(eq(questions.id, parseInt(id)), eq(catalogs.userId, user.id)))
//     .get();

//   if (!catalog) {
//     throw new Error("Question not found or unauthorized");
//   }
//   await db.delete(questions).where(eq(questions.id, parseInt(id)));
//   return {
//     success: true,
//   };
// })
// .get("/questions/:questionId/options", async ({ params, user }) => {
//   const { questionId } = params;
//   const questionOptions = await db
//     .select({
//       id: options.id,
//       text: options.text,
//       isCorrect: options.isCorrect,
//       createdAt: options.createdAt,
//       updatedAt: options.updatedAt,
//     })
//     .from(options)
//     .innerJoin(questions, eq(options.questionId, questions.id))
//     .innerJoin(catalogs, eq(questions.catalogId, catalogs.id))
//     .where(
//       and(
//         eq(options.questionId, parseInt(questionId)),
//         eq(catalogs.userId, user.id)
//       )
//     )
//     .orderBy(options.createdAt);

//   return {
//     success: true,
//     options: questionOptions,
//   };
// })

// .post("/questions/:questionId/options", async ({ params, body, user }) => {
//   const { questionId } = params;
//   const { text, isCorrect } = body;

//   // Verify question ownership through catalog
//   const catalog = await db
//     .select()
//     .from(catalogs)
//     .innerJoin(questions, eq(questions.catalogId, catalogs.id))
//     .where(
//       and(
//         eq(questions.id, parseInt(questionId)),
//         eq(catalogs.userId, user.id)
//       )
//     )
//     .get();

//   if (!catalog) {
//     throw new Error("Question not found or unauthorized");
//   }

//   const newOption = await db
//     .insert(options)
//     .values({
//       text,
//       isCorrect,
//       questionId: parseInt(questionId),
//     })
//     .returning()
//     .get();

//   return {
//     success: true,
//     option: newOption,
//   };
// })

// .put(
//   "/options",
//   async ({ params, body, user }) => {
//     const { id } = params;
//     const { text, isCorrect } = body;

//     const catalog = await db
//       .select()
//       .from(catalogs)
//       .innerJoin(questions, eq(questions.catalogId, catalogs.id))
//       .innerJoin(options, eq(options.questionId, questions.id))
//       .where(and(eq(options.id, parseInt(id)), eq(catalogs.userId, user.id)))
//       .get();

//     if (!catalog) {
//       throw new Error("Option not found or unauthorized");
//     }

//     const updatedOption = await db
//       .update(options)
//       .set({
//         text,
//         isCorrect,
//         updatedAt: new Date(),
//       })
//       .where(eq(options.id, parseInt(id)))
//       .returning()
//       .get();

//     return {
//       success: true,
//       option: updatedOption,
//     };
//   },
//   { auth: true }
// )

// .delete(
//   "/options/",
//   async ({ params, user }) => {
//     if (!user?.id) {
//       throw new Error("Unauthorized");
//     }

//     const { id } = params;

//     // Verify ownership through catalog
//     const catalog = await db
//       .select()
//       .from(catalogs)
//       .innerJoin(questions, eq(questions.catalogId, catalogs.id))
//       .innerJoin(options, eq(options.questionId, questions.id))
//       .where(and(eq(options.id, parseInt(id)), eq(catalogs.userId, user.id)))
//       .get();

//     if (!catalog) {
//       throw new Error("Option not found or unauthorized");
//     }

//     await db.delete(options).where(eq(options.id, parseInt(id)));

//     return {
//       success: true,
//     };
//   },
//   { auth: true }
// );
