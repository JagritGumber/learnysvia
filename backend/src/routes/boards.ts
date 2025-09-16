import { db } from "@/database/db";
import { board, boardCollaborator } from "@/database/schemas/board";
import Elysia from "elysia";
import { eq, and } from "drizzle-orm";
import { betterAuth } from "@/macros/better-auth";
import z from "zod";

export const boardsRouter = new Elysia({ prefix: "/boards" })
  .use(betterAuth)
  .post(
    "/create",
    async ({ body, user }) => {
      const { name, description, isPublic } = body;

      const newBoard = await db
        .insert(board)
        .values({
          id: Bun.randomUUIDv7(),
          name,
          description,
          userId: user.id,
          isPublic: isPublic || false,
        })
        .returning();

      return {
        success: true,
        board: newBoard[0],
      };
    },
    {
      auth: true,
      body: z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        isPublic: z.boolean().optional(),
      }),
    }
  )
  .get(
    "/",
    async ({ user }) => {
      const userBoards = await db
        .select()
        .from(board)
        .where(eq(board.userId, user.id))
        .orderBy(board.updatedAt);

      return {
        success: true,
        boards: userBoards,
      };
    },
    { auth: true }
  )
  .get(
    "/:id",
    async ({ params, user }) => {
      const { id } = params;

      // Check if user owns the board or is a collaborator
      const boardData = await db
        .select()
        .from(board)
        .where(and(eq(board.id, id), eq(board.userId, user.id)))
        .limit(1);

      if (boardData.length === 0) {
        // Check if user is a collaborator
        const collaboratorData = await db
          .select()
          .from(boardCollaborator)
          .where(
            and(
              eq(boardCollaborator.boardId, id),
              eq(boardCollaborator.userId, user.id)
            )
          )
          .limit(1);

        if (collaboratorData.length === 0) {
          throw new Error("Board not found or access denied");
        }
      }

      return {
        success: true,
        board: boardData[0] || null,
      };
    },
    {
      auth: true,
      params: z.object({
        id: z.string(),
      }),
    }
  )
  .put(
    "/:id",
    async ({ params, body, user }) => {
      const { id } = params;
      const { name, description, isPublic } = body;

      // Check if user owns the board
      const existingBoard = await db
        .select()
        .from(board)
        .where(and(eq(board.id, id), eq(board.userId, user.id)))
        .limit(1);

      if (existingBoard.length === 0) {
        throw new Error("Board not found or access denied");
      }

      const updatedBoard = await db
        .update(board)
        .set({
          name,
          description,
          isPublic,
          updatedAt: new Date(),
        })
        .where(eq(board.id, id))
        .returning();

      return {
        success: true,
        board: updatedBoard[0],
      };
    },
    {
      auth: true,
      params: z.object({
        id: z.string(),
      }),
      body: z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        isPublic: z.boolean().optional(),
      }),
    }
  )
  .put(
    "/:id/data",
    async ({ params, body, user }) => {
      const { id } = params;
      const { data } = body;

      // Check if user owns the board or is a collaborator
      const boardData = await db
        .select()
        .from(board)
        .where(and(eq(board.id, id), eq(board.userId, user.id)))
        .limit(1);

      if (boardData.length === 0) {
        // Check if user is a collaborator
        const collaboratorData = await db
          .select()
          .from(boardCollaborator)
          .where(
            and(
              eq(boardCollaborator.boardId, id),
              eq(boardCollaborator.userId, user.id)
            )
          )
          .limit(1);

        if (collaboratorData.length === 0) {
          throw new Error("Board not found or access denied");
        }
      }

      await db
        .update(board)
        .set({
          data,
          updatedAt: new Date(),
        })
        .where(eq(board.id, id));

      return {
        success: true,
        message: "Board data saved successfully",
      };
    },
    {
      auth: true,
      params: z.object({
        id: z.string(),
      }),
      body: z.object({
        data: z.string(),
      }),
    }
  )
  .delete(
    "/:id",
    async ({ params, user }) => {
      const { id } = params;

      // Check if user owns the board
      const existingBoard = await db
        .select()
        .from(board)
        .where(and(eq(board.id, id), eq(board.userId, user.id)))
        .limit(1);

      if (existingBoard.length === 0) {
        throw new Error("Board not found or access denied");
      }

      await db.delete(board).where(eq(board.id, id));

      return {
        success: true,
        message: "Board deleted successfully",
      };
    },
    {
      auth: true,
      params: z.object({
        id: z.string(),
      }),
    }
  );
