import { db } from "@/database/db";
import { catalogs, questions, options } from "@/database/schemas/organization";
import Elysia from "elysia";
import { betterAuth } from "@/macros/better-auth";
import { eq, and } from "drizzle-orm";

export const pollsRouter = new Elysia({ prefix: "/polls" })
  .use(betterAuth)

  // Catalogs endpoints
  .get(
    "/catalogs",
    async ({ user }) => {
      if (!user?.id) {
        throw new Error("Unauthorized");
      }

      const userCatalogs = await db
        .select({
          id: catalogs.id,
          name: catalogs.name,
          description: catalogs.description,
          createdAt: catalogs.createdAt,
          updatedAt: catalogs.updatedAt,
          questionCount: db.$count(
            questions,
            eq(questions.catalogId, catalogs.id)
          ),
        })
        .from(catalogs)
        .leftJoin(questions, eq(questions.catalogId, catalogs.id))
        .where(eq(catalogs.userId, user.id))
        .groupBy(catalogs.id)
        .orderBy(catalogs.createdAt);

      return {
        success: true,
        catalogs: userCatalogs,
      };
    },
    { auth: true }
  )

  .post(
    "/catalogs",
    async ({ body, user }) => {
      if (!user?.id) {
        throw new Error("Unauthorized");
      }

      const { name, description } = body as {
        name: string;
        description?: string;
      };

      const newCatalog = await db
        .insert(catalogs)
        .values({
          name,
          description,
          userId: user.id,
        })
        .returning()
        .get();

      return {
        success: true,
        catalog: newCatalog,
      };
    },
    { auth: true }
  )

  .put(
    "/catalogs/:id",
    async ({ params, body, user }) => {
      if (!user?.id) {
        throw new Error("Unauthorized");
      }

      const { id } = params;
      const { name, description } = body as {
        name: string;
        description?: string;
      };

      const updatedCatalog = await db
        .update(catalogs)
        .set({
          name,
          description,
          updatedAt: new Date(),
        })
        .where(and(eq(catalogs.id, parseInt(id)), eq(catalogs.userId, user.id)))
        .returning()
        .get();

      return {
        success: true,
        catalog: updatedCatalog,
      };
    },
    { auth: true }
  )

  .delete(
    "/catalogs/:id",
    async ({ params, user }) => {
      if (!user?.id) {
        throw new Error("Unauthorized");
      }

      const { id } = params;

      await db
        .delete(catalogs)
        .where(
          and(eq(catalogs.id, parseInt(id)), eq(catalogs.userId, user.id))
        );

      return {
        success: true,
      };
    },
    { auth: true }
  )

  // Questions endpoints
  .get(
    "/catalogs/:catalogId/questions",
    async ({ params, user }) => {
      if (!user?.id) {
        throw new Error("Unauthorized");
      }

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
    },
    { auth: true }
  )

  .post(
    "/catalogs/:catalogId/questions",
    async ({ params, body, user }) => {
      if (!user?.id) {
        throw new Error("Unauthorized");
      }

      const { catalogId } = params;
      const { title, content } = body as { title: string; content: string };

      // Verify catalog ownership
      const catalog = await db
        .select()
        .from(catalogs)
        .where(
          and(
            eq(catalogs.id, parseInt(catalogId)),
            eq(catalogs.userId, user.id)
          )
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
    },
    { auth: true }
  )

  .put(
    "/questions/:id",
    async ({ params, body, user }) => {
      if (!user?.id) {
        throw new Error("Unauthorized");
      }

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
        .where(
          and(eq(questions.id, parseInt(id)), eq(catalogs.userId, user.id))
        )
        .get();

      if (!catalog) {
        throw new Error("Question not found or unauthorized");
      }

      return {
        success: true,
        question: updatedQuestion,
      };
    },
    { auth: true }
  )

  .delete(
    "/questions/:id",
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
        .where(
          and(eq(questions.id, parseInt(id)), eq(catalogs.userId, user.id))
        )
        .get();

      if (!catalog) {
        throw new Error("Question not found or unauthorized");
      }

      await db.delete(questions).where(eq(questions.id, parseInt(id)));

      return {
        success: true,
      };
    },
    { auth: true }
  )

  // Options endpoints
  .get(
    "/questions/:questionId/options",
    async ({ params, user }) => {
      if (!user?.id) {
        throw new Error("Unauthorized");
      }

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
    },
    { auth: true }
  )

  .post(
    "/questions/:questionId/options",
    async ({ params, body, user }) => {
      if (!user?.id) {
        throw new Error("Unauthorized");
      }

      const { questionId } = params;
      const { text, isCorrect } = body as { text: string; isCorrect: boolean };

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
    },
    { auth: true }
  )

  .put(
    "/options/:id",
    async ({ params, body, user }) => {
      if (!user?.id) {
        throw new Error("Unauthorized");
      }

      const { id } = params;
      const { text, isCorrect } = body as { text: string; isCorrect: boolean };

      // Verify ownership through catalog
      const catalog = await db
        .select()
        .from(catalogs)
        .innerJoin(questions, eq(questions.catalogId, catalogs.id))
        .innerJoin(options, eq(options.questionId, questions.id))
        .where(
          and(
            eq(options.id, parseInt(id)),
            eq(catalogs.userId, user.id)
          )
        )
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
        .where(
          and(
            eq(options.id, parseInt(id)),
            eq(catalogs.userId, user.id)
          )
        )
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
