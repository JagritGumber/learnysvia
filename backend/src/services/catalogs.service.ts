import { db } from "@/database/db";
import * as t from "@/database/schemas";
import * as q from "drizzle-orm";

export const getUserCatalogs = async (userId: string) => {
  return await db
    .select({
      id: t.catalogs.id,
      name: t.catalogs.name,
      description: t.catalogs.description,
      createdAt: t.catalogs.createdAt,
      updatedAt: t.catalogs.updatedAt,
      questionCount: db.$count(
        t.questions,
        q.eq(t.questions.catalogId, t.catalogs.id)
      ),
    })
    .from(t.catalogs)
    .leftJoin(t.questions, q.eq(t.questions.catalogId, t.catalogs.id))
    .where(q.eq(t.catalogs.userId, userId))
    .groupBy(t.catalogs.id)
    .orderBy(t.catalogs.createdAt);
};

export const getUserCatalog = async (
  cid: string,
  { userId }: { userId: string }
) => {
  return await db
    .select()
    .from(t.catalogs)
    .where(q.and(q.eq(t.catalogs.id, cid), q.eq(t.catalogs.userId, userId)))
    .get();
};

export const getUserCatalogWithQuestions = async (
  cid: string,
  { userId }: { userId: string }
) => {
  const catalog = await db
    .select({
      id: t.catalogs.id,
      name: t.catalogs.name,
      description: t.catalogs.description,
      userId: t.catalogs.userId,
      createdAt: t.catalogs.createdAt,
      updatedAt: t.catalogs.updatedAt,
    })
    .from(t.catalogs)
    .where(q.and(q.eq(t.catalogs.id, cid), q.eq(t.catalogs.userId, userId)))
    .get();

  if (!catalog) {
    return null;
  }

  const questions = await db
    .select({
      id: t.questions.id,
      title: t.questions.title,
      content: t.questions.content,
      catalogId: t.questions.catalogId,
      createdAt: t.questions.createdAt,
      updatedAt: t.questions.updatedAt,
    })
    .from(t.questions)
    .where(q.eq(t.questions.catalogId, cid))
    .orderBy(t.questions.createdAt);

  return {
    ...catalog,
    questions,
  };
};

export const createEmptyCatalog = async ({
  name,
  description,
  userId,
}: {
  name: string;
  description: string | null | undefined;
  userId: string;
}) => {
  return await db
    .insert(t.catalogs)
    .values({
      name,
      description,
      userId: userId,
    })
    .returning()
    .get();
};

export const updateCatalog = async (
  id: string,
  {
    name,
    description,
    userId,
  }: {
    name: string | undefined;
    description: string | null | undefined;
    userId: string;
  }
) => {
  return await db
    .update(t.catalogs)
    .set({
      name,
      description,
    })
    .where(q.and(q.eq(t.catalogs.id, id), q.eq(t.catalogs.userId, userId)))
    .returning()
    .get();
};

export const deleteCatalog = async ({
  userId,
  catalogId,
}: {
  userId: string;
  catalogId: string;
}) => {
  return await db
    .delete(t.catalogs)
    .where(
      q.and(q.eq(t.catalogs.id, catalogId), q.eq(t.catalogs.userId, userId))
    )
    .returning()
    .get();
};
