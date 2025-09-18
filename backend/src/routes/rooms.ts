import { Elysia, t } from "elysia";
import { eq, and, desc } from "drizzle-orm";
import { db } from "../database/db";
import { room, roomParticipant, roomSettings } from "../database/schemas";
import { user as userTable } from "../database/schemas/auth/user";
import { betterAuth } from "../macros/better-auth";

// Generate unique room code
function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Room creation schema
const createRoomSchema = t.Object({
  name: t.String({ minLength: 1, maxLength: 100 }),
  description: t.Optional(t.String({ maxLength: 500 })),
  isPublic: t.Optional(t.Boolean()),
  maxParticipants: t.Optional(t.Number({ minimum: 1, maximum: 1000 })),
  expiresAt: t.Optional(t.Date()),
});

// Room update schema
const updateRoomSchema = t.Object({
  name: t.Optional(t.String({ minLength: 1, maxLength: 100 })),
  description: t.Optional(t.String({ maxLength: 500 })),
  isPublic: t.Optional(t.Boolean()),
  maxParticipants: t.Optional(t.Number({ minimum: 1, maximum: 1000 })),
  expiresAt: t.Optional(t.Date()),
});

// Room settings schema
const roomSettingsSchema = t.Object({
  allowChat: t.Optional(t.Boolean()),
  allowFileSharing: t.Optional(t.Boolean()),
  requireApproval: t.Optional(t.Boolean()),
  customSettings: t.Optional(t.Any()),
});

export const roomsRouter = new Elysia({ prefix: "/rooms" })
  .model({
    createRoom: createRoomSchema,
    updateRoom: updateRoomSchema,
    roomSettings: roomSettingsSchema,
  })
  .use(betterAuth)
  // Create room
  .post(
    "/",
    async ({ body, set, user }) => {
      if (!user?.id) {
        set.status = 401;
        return { error: "Unauthorized" };
      }

      let roomCode: string;
      let attempts = 0;
      const maxAttempts = 10;

      // Generate unique room code
      do {
        roomCode = generateRoomCode();
        attempts++;
      } while (
        attempts < maxAttempts &&
        (await db.select().from(room).where(eq(room.code, roomCode))).length > 0
      );

      if (attempts >= maxAttempts) {
        set.status = 500;
        return { error: "Failed to generate unique room code" };
      }

      const roomId = Bun.randomUUIDv7();

      try {
        // Create room
        const newRoom = await db
          .insert(room)
          .values({
            id: roomId,
            code: roomCode,
            name: body.name,
            description: body.description,
            createdBy: user.id,
            isPublic: body.isPublic ?? true,
            maxParticipants: body.maxParticipants ?? 50,
            expiresAt: body.expiresAt,
          })
          .returning();

        // Create default room settings
        await db.insert(roomSettings).values({
          id: Bun.randomUUIDv7(),
          roomId: roomId,
          allowChat: true,
          allowFileSharing: true,
          requireApproval: false,
        });

        set.status = 201;
        return {
          room: newRoom[0],
          code: roomCode,
          shareUrl: `${
            process.env.FRONTEND_URL || "http://localhost:5173"
          }/join/${roomCode}`,
        };
      } catch (error) {
        console.error("Failed to create room:", error);
        set.status = 500;
        return { error: "Failed to create room" };
      }
    },
    {
      body: "createRoom",
      detail: {
        summary: "Create a new room",
        tags: ["rooms"],
      },
      auth: true,
    }
  )

  // Get user's rooms
  .get(
    "/",
    async ({ set, user }) => {
      if (!user?.id) {
        set.status = 401;
        return { error: "Unauthorized" };
      }

      try {
        const userRooms = await db
          .select()
          .from(room)
          .where(eq(room.createdBy, user.id))
          .orderBy(desc(room.createdAt));

        return { rooms: userRooms };
      } catch (error) {
        console.error("Failed to fetch rooms:", error);
        set.status = 500;
        return { error: "Failed to fetch rooms" };
      }
    },
    {
      detail: {
        summary: "Get user's rooms",
        tags: ["rooms"],
      },
      auth: true,
    }
  )

  // Get room by ID
  .get(
    "/:id",
    async ({ params: { id }, set, user }) => {
      if (!user?.id) {
        set.status = 401;
        return { error: "Unauthorized" };
      }

      try {
        const roomData = await db
          .select()
          .from(room)
          .where(and(eq(room.id, id), eq(room.createdBy, user.id)))
          .limit(1);

        if (roomData.length === 0) {
          set.status = 404;
          return { error: "Room not found" };
        }

        const settings = await db
          .select()
          .from(roomSettings)
          .where(eq(roomSettings.roomId, id))
          .limit(1);

        const participants = await db
          .select({
            id: roomParticipant.id,
            roomId: roomParticipant.roomId,
            userId: roomParticipant.userId,
            joinedAt: roomParticipant.joinedAt,
            userName: userTable.name,
            userEmail: userTable.email,
          })
          .from(roomParticipant)
          .leftJoin(userTable, eq(roomParticipant.userId, userTable.id))
          .where(eq(roomParticipant.roomId, id));

        return {
          room: roomData[0],
          settings: settings[0] || null,
          participants,
          participantCount: participants.length,
        };
      } catch (error) {
        console.error("Failed to fetch room:", error);
        set.status = 500;
        return { error: "Failed to fetch room" };
      }
    },
    {
      detail: {
        summary: "Get room by ID",
        tags: ["rooms"],
      },
      auth: true,
    }
  )

  // Update room
  .put(
    "/:id",
    async ({ params: { id }, body, set, user }) => {
      if (!user?.id) {
        set.status = 401;
        return { error: "Unauthorized" };
      }

      try {
        // Check if user owns the room
        const roomData = await db
          .select()
          .from(room)
          .where(and(eq(room.id, id), eq(room.createdBy, user.id)))
          .limit(1);

        if (roomData.length === 0) {
          set.status = 404;
          return { error: "Room not found or access denied" };
        }

        const updatedRoom = await db
          .update(room)
          .set({
            ...body,
            updatedAt: new Date(),
          })
          .where(eq(room.id, id))
          .returning();

        return { room: updatedRoom[0] };
      } catch (error) {
        console.error("Failed to update room:", error);
        set.status = 500;
        return { error: "Failed to update room" };
      }
    },
    {
      body: "updateRoom",
      detail: {
        summary: "Update room",
        tags: ["rooms"],
      },
      auth: true,
    }
  )

  // Delete room
  .delete(
    "/:id",
    async ({ params: { id }, set, user }) => {
      if (!user?.id) {
        set.status = 401;
        return { error: "Unauthorized" };
      }

      try {
        // Check if user owns the room
        const roomData = await db
          .select()
          .from(room)
          .where(and(eq(room.id, id), eq(room.createdBy, user.id)))
          .limit(1);

        if (roomData.length === 0) {
          set.status = 404;
          return { error: "Room not found or access denied" };
        }

        // Delete room participants first (due to foreign key constraints)
        await db.delete(roomParticipant).where(eq(roomParticipant.roomId, id));

        // Delete room settings
        await db.delete(roomSettings).where(eq(roomSettings.roomId, id));

        // Delete room
        await db.delete(room).where(eq(room.id, id));

        return { success: true, message: "Room deleted successfully" };
      } catch (error) {
        console.error("Failed to delete room:", error);
        set.status = 500;
        return { error: "Failed to delete room" };
      }
    },
    {
      detail: {
        summary: "Delete room",
        tags: ["rooms"],
      },
      auth: true,
    }
  )

  // Join room by code
  .post(
    "/:code/join",
    async ({ params: { code }, set, user }) => {
      if (!user?.id) {
        set.status = 401;
        return { error: "Unauthorized" };
      }

      try {
        // Find room by code
        const roomData = await db
          .select()
          .from(room)
          .where(eq(room.code, code))
          .limit(1);

        if (roomData.length === 0) {
          set.status = 404;
          return { error: "Room not found" };
        }

        const foundRoom = roomData[0];

        // Check if room is expired
        if (foundRoom.expiresAt && new Date(foundRoom.expiresAt) < new Date()) {
          set.status = 410;
          return { error: "Room has expired" };
        }

        // Check participant limit
        const participantCount = await db
          .select()
          .from(roomParticipant)
          .where(eq(roomParticipant.roomId, foundRoom.id));

        if (participantCount.length >= (foundRoom.maxParticipants || 50)) {
          set.status = 409;
          return { error: "Room is full" };
        }

        // Check if user is already a participant
        const existingParticipant = await db
          .select()
          .from(roomParticipant)
          .where(
            and(
              eq(roomParticipant.roomId, foundRoom.id),
              eq(roomParticipant.userId, user.id)
            )
          )
          .limit(1);

        if (existingParticipant.length > 0) {
          return {
            success: true,
            message: "Already joined room",
            room: foundRoom,
          };
        }

        // Add participant
        await db.insert(roomParticipant).values({
          id: Bun.randomUUIDv7(),
          roomId: foundRoom.id,
          userId: user.id,
        });

        return {
          success: true,
          message: "Joined room successfully",
          room: foundRoom,
        };
      } catch (error) {
        console.error("Failed to join room:", error);
        set.status = 500;
        return { error: "Failed to join room" };
      }
    },
    {
      detail: {
        summary: "Join room by code",
        tags: ["rooms"],
      },
      auth: true,
    }
  )

  // Get room participants
  .get(
    "/:id/participants",
    async ({ params: { id }, set, user }) => {
      if (!user?.id) {
        set.status = 401;
        return { error: "Unauthorized" };
      }

      try {
        // Check if user owns the room
        const roomData = await db
          .select()
          .from(room)
          .where(and(eq(room.id, id), eq(room.createdBy, user.id)))
          .limit(1);

        if (roomData.length === 0) {
          set.status = 404;
          return { error: "Room not found or access denied" };
        }

        const participants = await db
          .select()
          .from(roomParticipant)
          .where(eq(roomParticipant.roomId, id));

        return { participants };
      } catch (error) {
        console.error("Failed to fetch participants:", error);
        set.status = 500;
        return { error: "Failed to fetch participants" };
      }
    },
    {
      detail: {
        summary: "Get room participants",
        tags: ["rooms"],
      },
      auth: true,
    }
  )

  // Update room settings
  .put(
    "/:id/settings",
    async ({ params: { id }, body, set, user }) => {
      if (!user?.id) {
        set.status = 401;
        return { error: "Unauthorized" };
      }

      try {
        // Check if user owns the room
        const roomData = await db
          .select()
          .from(room)
          .where(and(eq(room.id, id), eq(room.createdBy, user.id)))
          .limit(1);

        if (roomData.length === 0) {
          set.status = 404;
          return { error: "Room not found or access denied" };
        }

        const existingSettings = await db
          .select()
          .from(roomSettings)
          .where(eq(roomSettings.roomId, id))
          .limit(1);

        if (existingSettings.length === 0) {
          // Create new settings
          await db.insert(roomSettings).values({
            id: Bun.randomUUIDv7(),
            roomId: id,
            ...body,
          });
        } else {
          // Update existing settings
          await db
            .update(roomSettings)
            .set(body)
            .where(eq(roomSettings.roomId, id));
        }

        return { success: true, message: "Settings updated successfully" };
      } catch (error) {
        console.error("Failed to update room settings:", error);
        set.status = 500;
        return { error: "Failed to update room settings" };
      }
    },
    {
      body: "roomSettings",
      detail: {
        summary: "Update room settings",
        tags: ["rooms"],
      },
      auth: true,
    }
  );
