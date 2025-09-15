import { db } from "@/database/db";
import { lesson } from "@/database/schemas/lesson";
import Elysia from "elysia";
import { eq } from "drizzle-orm";
import { betterAuth } from "@/macros/better-auth";
import z from "zod";

export const lessonsRouter = new Elysia({ prefix: "/lessons" })
  .use(betterAuth)
  .post(
    "/create",
    async ({ body, user }) => {
      const { name, description, scheduledDate, scheduledTime, duration } = body;

      const newLesson = await db
        .insert(lesson)
        .values({
          id: crypto.randomUUID(),
          name,
          description,
          userId: user.id,
          scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
          scheduledTime,
          duration,
        })
        .returning();

      return {
        success: true,
        lesson: newLesson[0],
      };
    },
    {
      auth: true,
      body: z.object({
        name: z.string().min(1),
        description: z.string().min(1),
        scheduledDate: z.string().optional(),
        scheduledTime: z.string().optional(),
        duration: z.number().min(15).max(480).default(60),
      }),
    }
  )
  .get(
    "/",
    async ({ user }) => {
      const userLessons = await db
        .select()
        .from(lesson)
        .where(eq(lesson.userId, user.id))
        .orderBy(lesson.createdAt);

      return {
        success: true,
        lessons: userLessons,
      };
    },
    { auth: true }
  );
