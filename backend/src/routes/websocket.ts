import { Elysia, TSchema } from "elysia";
import { TypeCheck } from "elysia/type-system";
import { ServerWebSocket } from "elysia/ws/bun";

// Store active connections per room with user info
const roomConnections = new Map<
  string,
  Map<
    string,
    {
      ws: ServerWebSocket<{
        id?: string | undefined;
        validator?: TypeCheck<TSchema> | undefined;
      }>;
      userId: string;
      displayName: string;
    }
  >
>();

export const websocketRouter = new Elysia({ prefix: "/ws" })
  .ws("/room/:roomId", {
    open(ws) {
      const { roomId } = ws.data.params;

      // Add connection to room (will be populated when user joins)
      if (!roomConnections.has(roomId)) {
        roomConnections.set(roomId, new Map());
      }
    },

    message(ws, message) {
      const { roomId } = ws.data.params;

      try {
        console.log("Received message:", message);
        // Handle both parsed objects and JSON strings
        const data = typeof message === 'string' ? JSON.parse(message) : message;

        switch (data.type) {
          case "join":
            // User joining with display name
            const connections = roomConnections.get(roomId);
            if (connections) {
              connections.set(ws.id, {
                ws: ws.raw,
                userId: data.userId || `anon_${Date.now()}`,
                displayName: data.displayName || "Anonymous",
              });

              // Broadcast user joined
              broadcastToRoom(
                roomId,
                {
                  type: "user_joined",
                  userId: data.userId,
                  displayName: data.displayName,
                },
                ws.raw
              );
            }
            break;

          case "chat_message":
            const userInfo = roomConnections.get(roomId)?.get(ws.id);
            if (userInfo) {
              broadcastToRoom(
                roomId,
                {
                  type: "chat_message",
                  userId: userInfo.userId,
                  displayName: userInfo.displayName,
                  message: data.message,
                  timestamp: new Date().toISOString(),
                },
                ws.raw
              );
            }
            break;

          case "typing_start":
            const typingUser = roomConnections.get(roomId)?.get(ws.id);
            if (typingUser) {
              broadcastToRoom(
                roomId,
                {
                  type: "typing_start",
                  userId: typingUser.userId,
                  displayName: typingUser.displayName,
                },
                ws.raw
              );
            }
            break;

          case "typing_stop":
            const stopTypingUser = roomConnections.get(roomId)?.get(ws.id);
            if (stopTypingUser) {
              broadcastToRoom(
                roomId,
                {
                  type: "typing_stop",
                  userId: stopTypingUser.userId,
                  displayName: stopTypingUser.displayName,
                },
                ws.raw
              );
            }
            break;
        }
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    },

    close(ws) {
      const { roomId } = ws.data.params;

      // Remove connection from room
      const connections = roomConnections.get(roomId);
      if (connections) {
        const userInfo = connections.get(ws.id);
        connections.delete(ws.id);

        if (connections.size === 0) {
          roomConnections.delete(roomId);
        }

        // Broadcast user left
        if (userInfo) {
          broadcastToRoom(roomId, {
            type: "user_left",
            userId: userInfo.userId,
            displayName: userInfo.displayName,
          });
        }
      }
    },
  })
  .ws("/room/validate/:roomCode", {
    open(ws) {
      const { roomCode } = ws.data.params;
      console.log(`Validation connection opened for room code: ${roomCode}`);
    },

    message(ws, message) {
      try {
        // Handle both parsed objects and JSON strings
        const data = typeof message === 'string' ? JSON.parse(message) : message;

        if (data.type === "validate") {
          // For now, we'll assume the room exists if we can connect
          // In a real implementation, you'd validate against the database
          const mockRoom = {
            id: "room_" + Date.now(),
            name: "Sample Room",
            description: "A room for testing",
            createdBy: "Host User",
          };

          ws.send(
            JSON.stringify({
              type: "validated",
              room: mockRoom,
            })
          );
        }
      } catch (error) {
        console.error("Error in validation websocket:", error);
        ws.send(
          JSON.stringify({
            type: "error",
            message: "Validation failed",
          })
        );
      }
    },

    close(ws) {
      console.log("Validation connection closed");
    },
  });

function broadcastToRoom(roomId: string, message: any, excludeWs?: any) {
  const connections = roomConnections.get(roomId);
  if (!connections) return;

  const messageStr = JSON.stringify(message);

  for (const [, userData] of connections) {
    const ws = userData.ws;
    if (ws !== excludeWs && ws.readyState === WebSocket.OPEN) {
      ws.send(messageStr);
    }
  }
}
