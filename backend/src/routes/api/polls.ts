import { db } from "@/database/db";
import {
  catalogs,
  questions,
  options,
  createCatalogSchema,
  updateCatalogSchema,
} from "@/database/schemas/core";
import Elysia from "elysia";
import { betterAuth } from "@/macros/better-auth";
import { eq, and } from "drizzle-orm";
import z from "zod";

export const pollsRouter = new Elysia({ prefix: "/polls" })
  .use(betterAuth)
  // Questions endpoints
  .get("/catalogs/:catalogId/questions", async ({ params, user }) => {
    const { catalogId } = params;

    const catalogQuestions = await db
      .select({
        id: questions.id,
        title: questions.title,
        content: questions.content,
        createdAt: questions.createdAt,
        updatedAt: questions.updatedAt,
      })
      .from(questions)
      .innerJoin(catalogs, eq(questions.catalogId, catalogs.id))
      .where(
        and(
          eq(questions.catalogId, parseInt(catalogId)),
          eq(catalogs.userId, user.id)
        )
      )
      .orderBy(questions.createdAt);

    return {
      success: true,
      questions: catalogQuestions,
    };
  })

  .post("/catalogs/:catalogId/questions", async ({ params, body, user }) => {
    const { catalogId } = params;
    const { title, content } = body as { title: string; content: string };

    const catalog = await db
      .select()
      .from(catalogs)
      .where(
        and(eq(catalogs.id, parseInt(catalogId)), eq(catalogs.userId, user.id))
      )
      .get();

    if (!catalog) {
      throw new Error("Catalog not found or unauthorized");
    }

    const newQuestion = await db
      .insert(questions)
      .values({
        title,
        content,
        catalogId: parseInt(catalogId),
      })
      .returning()
      .get();

    return {
      success: true,
      question: newQuestion,
    };
  })

  .put("/questions/:id", async ({ params, body, user }) => {
    const { id } = params;
    const { title, content } = body as { title: string; content: string };

    const updatedQuestion = await db
      .update(questions)
      .set({
        title,
        content,
        updatedAt: new Date(),
      })
      .where(eq(questions.id, parseInt(id)))
      .returning()
      .get();

    // Verify ownership through catalog
    const catalog = await db
      .select()
      .from(catalogs)
      .innerJoin(questions, eq(questions.catalogId, catalogs.id))
      .where(and(eq(questions.id, parseInt(id)), eq(catalogs.userId, user.id)))
      .get();
    return {
      success: true,
      question: updatedQuestion,
    };
  })

  .delete("/questions/:id", async ({ params, user }) => {
    const { id } = params;
    const catalog = await db
      .select()
      .from(catalogs)
      .innerJoin(questions, eq(questions.catalogId, catalogs.id))
      .where(and(eq(questions.id, parseInt(id)), eq(catalogs.userId, user.id)))
      .get();

    if (!catalog) {
      throw new Error("Question not found or unauthorized");
    }
    await db.delete(questions).where(eq(questions.id, parseInt(id)));
    return {
      success: true,
    };
  })
  .get("/questions/:questionId/options", async ({ params, user }) => {
    const { questionId } = params;
    const questionOptions = await db
      .select({
        id: options.id,
        text: options.text,
        isCorrect: options.isCorrect,
        createdAt: options.createdAt,
        updatedAt: options.updatedAt,
      })
      .from(options)
      .innerJoin(questions, eq(options.questionId, questions.id))
      .innerJoin(catalogs, eq(questions.catalogId, catalogs.id))
      .where(
        and(
          eq(options.questionId, parseInt(questionId)),
          eq(catalogs.userId, user.id)
        )
      )
      .orderBy(options.createdAt);

    return {
      success: true,
      options: questionOptions,
    };
  })

  .post("/questions/:questionId/options", async ({ params, body, user }) => {
    const { questionId } = params;
    const { text, isCorrect } = body;

    // Verify question ownership through catalog
    const catalog = await db
      .select()
      .from(catalogs)
      .innerJoin(questions, eq(questions.catalogId, catalogs.id))
      .where(
        and(
          eq(questions.id, parseInt(questionId)),
          eq(catalogs.userId, user.id)
        )
      )
      .get();

    if (!catalog) {
      throw new Error("Question not found or unauthorized");
    }

    const newOption = await db
      .insert(options)
      .values({
        text,
        isCorrect,
        questionId: parseInt(questionId),
      })
      .returning()
      .get();

    return {
      success: true,
      option: newOption,
    };
  })

  .put(
    "/options/:id",
    async ({ params, body, user }) => {
      const { id } = params;
      const { text, isCorrect } = body;

      const catalog = await db
        .select()
        .from(catalogs)
        .innerJoin(questions, eq(questions.catalogId, catalogs.id))
        .innerJoin(options, eq(options.questionId, questions.id))
        .where(and(eq(options.id, parseInt(id)), eq(catalogs.userId, user.id)))
        .get();

      if (!catalog) {
        throw new Error("Option not found or unauthorized");
      }

      const updatedOption = await db
        .update(options)
        .set({
          text,
          isCorrect,
          updatedAt: new Date(),
        })
        .where(eq(options.id, parseInt(id)))
        .returning()
        .get();

      return {
        success: true,
        option: updatedOption,
      };
    },
    { auth: true }
  )

  .delete(
    "/options/:id",
    async ({ params, user }) => {
      if (!user?.id) {
        throw new Error("Unauthorized");
      }

      const { id } = params;

      // Verify ownership through catalog
      const catalog = await db
        .select()
        .from(catalogs)
        .innerJoin(questions, eq(questions.catalogId, catalogs.id))
        .innerJoin(options, eq(options.questionId, questions.id))
        .where(and(eq(options.id, parseInt(id)), eq(catalogs.userId, user.id)))
        .get();

      if (!catalog) {
        throw new Error("Option not found or unauthorized");
      }

      await db.delete(options).where(eq(options.id, parseInt(id)));

      return {
        success: true,
      };
    },
    { auth: true }
  );
