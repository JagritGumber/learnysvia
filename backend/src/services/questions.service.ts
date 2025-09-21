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
      title: t.questions.title,
      content: t.questions.content,
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
    title,
    content,
  }: {
    title: string;
    content: string;
  }
) => {
  return await db
    .insert(t.questions)
    .values({
      title,
      content,
      catalogId: catalogId,
    })
    .returning()
    .get();
};

export const updateCatalogQuestion = async (
  qid: string,
  {
    title,
    content,
  }: {
    title: string | undefined;
    content: string | undefined;
  }
) => {
  await db
    .update(t.questions)
    .set({
      title,
      content,
    })
    .where(q.eq(t.questions.id, qid))
    .returning()
    .get();
};

export const deleteCatalogQuestion = async (qid: string) => {
  return await db
    .delete(t.questions)
    .where(q.eq(t.questions.id, qid))
    .returning()
    .get();
};

export const getCatalogQuestion = async (qid: string) => {
  return await db
    .select()
    .from(t.questions)
    .where(q.eq(t.questions.id, qid))
    .get();
};
