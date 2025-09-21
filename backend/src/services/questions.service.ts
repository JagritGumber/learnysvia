import { db } from "@/database/db";
import * as t from "@/database/schemas";
import * as q from "drizzle-orm";

export const getCatalogQuestions = async ({
  catalogId,
  userId,
}: {
  catalogId: string;
  userId: string;
}) => {
  return await db
    .select({
      id: t.questions.id,
      text: t.questions.text,
      createdAt: t.questions.createdAt,
      updatedAt: t.questions.updatedAt,
    })
    .from(t.questions)
    .innerJoin(t.catalogs, q.eq(t.questions.catalogId, t.catalogs.id))
    .where(
      q.and(
        q.eq(t.questions.catalogId, catalogId),
        q.eq(t.catalogs.userId, userId)
      )
    )
    .orderBy(t.questions.createdAt);
};

export const createCatalogQuestion = async (
  catalogId: string,
  {
    text,
    options,
  }: {
    text: string;
    options?: { text: string; isCorrect: boolean }[];
  }
) => {
  return await db.transaction(async (tx) => {
    // Create the question
    const question = await tx
      .insert(t.questions)
      .values({
        text,
        catalogId: catalogId,
      })
      .returning()
      .get();

    // Create options if provided
    if (options && options.length > 0) {
      await tx.insert(t.options).values(
        options.map(
          (option) =>
            ({
              text: option.text,
              isCorrect: option.isCorrect,
              questionId: question.id,
            } satisfies t.InsertOption)
        )
      );
    }

    return question;
  });
};

export const updateCatalogQuestion = async (
  qid: string,
  {
    text,
    options,
  }: {
    text: string | undefined;
    options?: { text: string; isCorrect: boolean }[];
  }
) => {
  return await db.transaction(async (tx) => {
    // Update the question text if provided
    if (text !== undefined) {
      await tx
        .update(t.questions)
        .set({
          text,
        })
        .where(q.eq(t.questions.id, qid));
    }

    // Update options if provided
    if (options !== undefined) {
      // Delete existing options
      await tx
        .delete(t.options)
        .where(q.eq(t.options.questionId, qid));

      // Insert new options
      if (options.length > 0) {
        await tx.insert(t.options).values(
          options.map(
            (option) =>
              ({
                text: option.text,
                isCorrect: option.isCorrect,
                questionId: qid,
              } satisfies t.InsertOption)
          )
        );
      }
    }

    // Return the updated question with options
    return await tx.query.questions.findFirst({
      where: q.eq(t.questions.id, qid),
      with: {
        options: true,
      },
    });
  });
};

export const deleteCatalogQuestion = async (qid: string) => {
  return await db
    .delete(t.questions)
    .where(q.eq(t.questions.id, qid))
    .returning()
    .get();
};

export const getCatalogQuestion = async (qid: string) => {
  return await db.query.questions.findFirst({
    where: q.eq(t.questions.id, qid),
    with: {
      options: true,
    },
  });
};
