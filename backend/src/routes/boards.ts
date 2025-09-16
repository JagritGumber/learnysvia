import { db } from "@/database/db";
import { board, boardCollaborator } from "@/database/schemas/board";
import Elysia from "elysia";
import { eq, and } from "drizzle-orm";
import { betterAuth } from "@/macros/better-auth";
import z from "zod";
import { Wit } from "node-wit";
import { env } from "@/env";

// Tldraw shape types
const ShapeSchema = z.object({
  id: z.string(),
  type: z.string(),
  x: z.number(),
  y: z.number(),
  props: z.any().optional(),
  parentId: z.string().optional(),
  rotation: z.number().optional(),
  isLocked: z.boolean().optional(),
});

const CreateShapeSchema = z.object({
  type: z.string(),
  x: z.number(),
  y: z.number(),
  props: z.any().optional(),
  parentId: z.string().optional(),
  rotation: z.number().optional(),
  isLocked: z.boolean().optional(),
});

const UpdateShapeSchema = z.object({
  x: z.number().optional(),
  y: z.number().optional(),
  props: z.record(z.any(), z.any()).optional(),
  parentId: z.string().optional(),
  rotation: z.number().optional(),
  isLocked: z.boolean().optional(),
});

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

      // Store MDX content as plain string (no JSON parsing needed)
      await db
        .update(board)
        .set({
          data,
          updatedAt: new Date(),
        })
        .where(eq(board.id, id));

      return {
        success: true,
        message: "Board MDX content saved successfully",
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
  )
  // Shape manipulation endpoints
  .post(
    "/shapes/:boardId",
    async ({ params, body, user }) => {
      const { boardId } = params;
      const shapeData = body;

      // Check access
      const boardData = await db
        .select()
        .from(board)
        .where(and(eq(board.id, boardId), eq(board.userId, user.id)))
        .limit(1);

      if (boardData.length === 0) {
        const collaboratorData = await db
          .select()
          .from(boardCollaborator)
          .where(
            and(
              eq(boardCollaborator.boardId, boardId),
              eq(boardCollaborator.userId, user.id)
            )
          )
          .limit(1);

        if (collaboratorData.length === 0) {
          throw new Error("Board not found or access denied");
        }
      }

      const currentBoard =
        boardData[0] ||
        (await db
          .select()
          .from(board)
          .where(eq(board.id, boardId))
          .limit(1)
          .then((rows) => rows[0]));

      if (!currentBoard) {
        throw new Error("Board not found");
      }

      // Get current snapshot
      let snapshot: any = { store: { shapes: {} } };
      if (currentBoard.data) {
        snapshot = currentBoard.data;
      }

      // Generate shape ID
      const shapeId = Bun.randomUUIDv7();

      // Create shape
      const newShape = {
        id: shapeId,
        type: shapeData.type,
        x: shapeData.x,
        y: shapeData.y,
        props: shapeData.props || {},
        parentId: shapeData.parentId || "page",
        rotation: shapeData.rotation || 0,
        isLocked: shapeData.isLocked || false,
      };

      // Add shape to snapshot
      if (!snapshot.store) snapshot.store = { shapes: {} };
      if (!snapshot.store.shapes) snapshot.store.shapes = {};
      snapshot.store.shapes[shapeId] = newShape;

      // Save updated snapshot
      await db
        .update(board)
        .set({
          data: JSON.stringify(snapshot),
          updatedAt: new Date(),
        })
        .where(eq(board.id, boardId));

      return {
        success: true,
        shape: newShape,
      };
    },
    {
      auth: true,
      params: z.object({
        boardId: z.string(),
      }),
      body: CreateShapeSchema,
    }
  )
  .put(
    "/shapes/:boardId/:shapeId",
    async ({ params, body, user }) => {
      const { boardId, shapeId } = params;
      const updates = body;

      // Check access
      const boardData = await db
        .select()
        .from(board)
        .where(and(eq(board.id, boardId), eq(board.userId, user.id)))
        .limit(1);

      if (boardData.length === 0) {
        const collaboratorData = await db
          .select()
          .from(boardCollaborator)
          .where(
            and(
              eq(boardCollaborator.boardId, boardId),
              eq(boardCollaborator.userId, user.id)
            )
          )
          .limit(1);

        if (collaboratorData.length === 0) {
          throw new Error("Board not found or access denied");
        }
      }

      const currentBoard =
        boardData[0] ||
        (await db
          .select()
          .from(board)
          .where(eq(board.id, boardId))
          .limit(1)
          .then((rows) => rows[0]));

      if (!currentBoard) {
        throw new Error("Board not found");
      }

      // Get current snapshot
      let snapshot: any = { store: { shapes: {} } };
      if (currentBoard.data) {
        snapshot = currentBoard.data;
      }

      // Check if shape exists
      if (!snapshot.store?.shapes?.[shapeId]) {
        throw new Error("Shape not found");
      }

      // Update shape
      const existingShape = snapshot.store.shapes[shapeId];
      const updatedShape = {
        ...existingShape,
        ...updates,
      };

      snapshot.store.shapes[shapeId] = updatedShape;

      // Save updated snapshot
      await db
        .update(board)
        .set({
          data: JSON.stringify(snapshot),
          updatedAt: new Date(),
        })
        .where(eq(board.id, boardId));

      return {
        success: true,
        shape: updatedShape,
      };
    },
    {
      auth: true,
      params: z.object({
        boardId: z.string(),
        shapeId: z.string(),
      }),
      body: UpdateShapeSchema,
    }
  )
  .delete(
    "/shapes/:boardId/:shapeId",
    async ({ params, user }) => {
      const { boardId, shapeId } = params;

      // Check access
      const boardData = await db
        .select()
        .from(board)
        .where(and(eq(board.id, boardId), eq(board.userId, user.id)))
        .limit(1);

      if (boardData.length === 0) {
        const collaboratorData = await db
          .select()
          .from(boardCollaborator)
          .where(
            and(
              eq(boardCollaborator.boardId, boardId),
              eq(boardCollaborator.userId, user.id)
            )
          )
          .limit(1);

        if (collaboratorData.length === 0) {
          throw new Error("Board not found or access denied");
        }
      }

      const currentBoard =
        boardData[0] ||
        (await db
          .select()
          .from(board)
          .where(eq(board.id, boardId))
          .limit(1)
          .then((rows) => rows[0]));

      if (!currentBoard) {
        throw new Error("Board not found");
      }

      // Get current snapshot
      let snapshot: any = { store: { shapes: {} } };
      if (currentBoard.data) {
        snapshot = currentBoard.data;
      }

      // Check if shape exists
      if (!snapshot.store?.shapes?.[shapeId]) {
        throw new Error("Shape not found");
      }

      // Delete shape
      delete snapshot.store.shapes[shapeId];

      // Save updated snapshot
      await db
        .update(board)
        .set({
          data: JSON.stringify(snapshot),
          updatedAt: new Date(),
        })
        .where(eq(board.id, boardId));

      return {
        success: true,
        message: "Shape deleted successfully",
      };
    },
    {
      auth: true,
      params: z.object({
        boardId: z.string(),
        shapeId: z.string(),
      }),
    }
  )
  .get(
    "/shapes/:boardId",
    async ({ params, user }) => {
      const { boardId } = params;

      // Check access
      const boardData = await db
        .select()
        .from(board)
        .where(and(eq(board.id, boardId), eq(board.userId, user.id)))
        .limit(1);

      if (boardData.length === 0) {
        const collaboratorData = await db
          .select()
          .from(boardCollaborator)
          .where(
            and(
              eq(boardCollaborator.boardId, boardId),
              eq(boardCollaborator.userId, user.id)
            )
          )
          .limit(1);

        if (collaboratorData.length === 0) {
          throw new Error("Board not found or access denied");
        }
      }

      const currentBoard =
        boardData[0] ||
        (await db
          .select()
          .from(board)
          .where(eq(board.id, boardId))
          .limit(1)
          .then((rows) => rows[0]));

      if (!currentBoard) {
        throw new Error("Board not found");
      }

      // Get current snapshot
      let snapshot: any = { store: { shapes: {} } };
      if (currentBoard.data) {
        snapshot = currentBoard.data;
      }

      const shapes = snapshot.store?.shapes || {};

      return {
        success: true,
        shapes: Object.values(shapes),
      };
    },
    {
      auth: true,
      params: z.object({
        boardId: z.string(),
      }),
    }
  )
  .get(
    "/shapes/:boardId/:shapeId",
    async ({ params, user }) => {
      const { boardId, shapeId } = params;

      // Check access
      const boardData = await db
        .select()
        .from(board)
        .where(and(eq(board.id, boardId), eq(board.userId, user.id)))
        .limit(1);

      if (boardData.length === 0) {
        const collaboratorData = await db
          .select()
          .from(boardCollaborator)
          .where(
            and(
              eq(boardCollaborator.boardId, boardId),
              eq(boardCollaborator.userId, user.id)
            )
          )
          .limit(1);

        if (collaboratorData.length === 0) {
          throw new Error("Board not found or access denied");
        }
      }

      const currentBoard =
        boardData[0] ||
        (await db
          .select()
          .from(board)
          .where(eq(board.id, boardId))
          .limit(1)
          .then((rows) => rows[0]));

      if (!currentBoard) {
        throw new Error("Board not found");
      }

      // Get current snapshot
      let snapshot: any = { store: { shapes: {} } };
      if (currentBoard.data) {
        snapshot = currentBoard.data;
      }

      const shape = snapshot.store?.shapes?.[shapeId];

      if (!shape) {
        throw new Error("Shape not found");
      }

      return {
        success: true,
        shape,
      };
    },
    {
      auth: true,
      params: z.object({
        boardId: z.string(),
        shapeId: z.string(),
      }),
    }
  )
  // Speech processing endpoint for MDX content generation
  .post(
    "/speech/:boardId",
    async ({ params, body, user }) => {
      const { boardId } = params;
      const { transcript } = body;

      // Check access
      const boardData = await db
        .select()
        .from(board)
        .where(and(eq(board.id, boardId), eq(board.userId, user.id)))
        .limit(1);

      if (boardData.length === 0) {
        const collaboratorData = await db
          .select()
          .from(boardCollaborator)
          .where(
            and(
              eq(boardCollaborator.boardId, boardId),
              eq(boardCollaborator.userId, user.id)
            )
          )
          .limit(1);

        if (collaboratorData.length === 0) {
          throw new Error("Board not found or access denied");
        }
      }

      const currentBoard =
        boardData[0] ||
        (await db
          .select()
          .from(board)
          .where(eq(board.id, boardId))
          .limit(1)
          .then((rows) => rows[0]));

      if (!currentBoard) {
        throw new Error("Board not found");
      }

      try {
        // Send transcript to Wit.ai for processing using fetch
        const witResponse = await fetch(
          `https://api.wit.ai/message?v=20250917&q=${encodeURIComponent(
            transcript
          )}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${env.WIT_API_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!witResponse.ok) {
          throw new Error(`Wit.ai API error: ${witResponse.status}`);
        }

        const witData = await witResponse.json();
        console.log("Wit.ai response:", witData);

        // Process intents and generate MDX content based on utterances
        let mdxContent = "";

        // Check for various intents and generate appropriate MDX
        if (witData.intents && witData.intents.length > 0) {
          const intent = witData.intents[0];

          // Extract text from entities or use the full transcript
          let contentText = transcript;
          if (
            witData.entities &&
            witData.entities["wit$message_body:message_body"]
          ) {
            const messageBody =
              witData.entities["wit$message_body:message_body"][0];
            if (messageBody && messageBody.value) {
              contentText = messageBody.value;
            }
          }

          switch (intent.name) {
            case "add_heading":
            case "create_title":
              mdxContent = `# ${contentText}\n\n`;
              break;

            case "add_subheading":
              mdxContent = `## ${contentText}\n\n`;
              break;

            case "add_paragraph":
            case "add_text":
              mdxContent = `${contentText}\n\n`;
              break;

            case "add_list":
            case "create_list":
              // Try to extract list items from the transcript
              const listItems = contentText
                .split(/[,;]|\sand\s|or\s/)
                .map(item => item.trim())
                .filter(item => item.length > 0)
                .map(item => `- ${item}`)
                .join('\n');
              mdxContent = `${listItems}\n\n`;
              break;

            case "add_code":
            case "create_code":
              mdxContent = "```javascript\n// Your code here\n```\n\n";
              break;

            case "add_diagram":
            case "create_diagram":
              mdxContent = "```mermaid\ngraph TD\n    A[Start] --> B[Process]\n    B --> C[End]\n```\n\n";
              break;

            case "add_quiz":
            case "create_quiz":
              mdxContent = "<Quiz question=\"What is 2+2?\" options={['3', '4', '5']} correct={1} />\n\n";
              break;

            default:
              // Default to adding as regular text
              mdxContent = `${contentText}\n\n`;
              break;
          }
        } else {
          // No specific intent detected, add as regular text
          mdxContent = `${transcript}\n\n`;
        }

        return {
          success: true,
          witData,
          mdxContent,
          message: mdxContent ? "MDX content generated successfully" : "No content generated",
        };
      } catch (error) {
        console.error("Wit.ai processing error:", error);
        throw new Error("Failed to process speech with Wit.ai");
      }
    },
    {
      auth: true,
      params: z.object({
        boardId: z.string(),
      }),
      body: z.object({
        transcript: z.string().min(1),
      }),
    }
  );
