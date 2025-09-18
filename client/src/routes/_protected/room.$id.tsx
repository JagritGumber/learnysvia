import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  roomsApi,
  type Room,
  type RoomParticipant,
} from "../../utils/rooms-api";
import { toast } from "react-hot-toast";
import { formatDate } from "date-fns";

export const Route = createFileRoute("/_protected/room/$id")({
  component: RoomPage,
});

function RoomPage() {
  const { id } = Route.useParams();
  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<RoomParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [displayName, setDisplayName] = useState("");
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    loadRoomData();
    connectWebSocket();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [id]);

  const connectWebSocket = () => {
    const ws = new WebSocket(`ws://localhost:3000/ws/room/${id}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("Connected to room websocket");
      // Join with display name
      ws.send(
        JSON.stringify({
          type: "join",
          displayName: displayName || "Anonymous",
        })
      );
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleWebSocketMessage(data);
    };

    ws.onclose = () => {
      console.log("Disconnected from room websocket");
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  };

  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case "user_joined":
        toast.success(`${data.displayName} joined the room`);
        break;
      case "user_left":
        toast(`${data.displayName} left the room`);
        break;
      case "chat_message":
        setMessages((prev) => [...prev, data]);
        break;
      case "typing_start":
        // Handle typing indicator
        break;
      case "typing_stop":
        // Handle typing indicator
        break;
    }
  };

  const sendMessage = (message: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "chat_message",
          message,
        })
      );
    }
  };

  const loadRoomData = async () => {
    try {
      setLoading(true);
      const roomData = await roomsApi.getRoom(id);
      setRoom(roomData.room);
      setParticipants(roomData.participants);
    } catch (err) {
      console.error("Failed to load room:", err);
      setError("Failed to load room data");
      toast.error("Failed to load room data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-base-100 flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-6">🚫</div>
          <h2 className="text-2xl font-semibold text-base-content mb-4">
            {error || "Room not found"}
          </h2>
          <p className="text-base-content/70 mb-6">
            The room you're looking for doesn't exist or you don't have access
            to it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-base-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => window.history.back()}
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back
            </button>
          </div>

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-base-content mb-2">
                {room.name}
              </h1>
              <p className="text-lg text-base-content/70 mb-2">
                Room Code:{" "}
                <span className="font-mono font-semibold">{room.code}</span>
              </p>
              {room.description && (
                <p className="text-base-content/80">{room.description}</p>
              )}
            </div>

            <div className="flex gap-2">
              <div
                className={`badge ${room.isPublic ? "badge-success" : "badge-warning"}`}
              >
                {room.isPublic ? "Public" : "Private"}
              </div>
            </div>
          </div>
        </div>

        {/* Room Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card bg-base-100 border border-base-300">
            <div className="card-body">
              <div className="flex items-center gap-3">
                <div className="text-3xl">👥</div>
                <div>
                  <div className="text-2xl font-bold">
                    {participants.length}
                  </div>
                  <div className="text-sm text-base-content/70">
                    Participants
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 border border-base-300">
            <div className="card-body">
              <div className="flex items-center gap-3">
                <div className="text-3xl">📊</div>
                <div>
                  <div className="text-2xl font-bold">
                    {room.maxParticipants}
                  </div>
                  <div className="text-sm text-base-content/70">
                    Max Capacity
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 border border-base-300">
            <div className="card-body">
              <div className="flex items-center gap-3">
                <div className="text-3xl">⏰</div>
                <div>
                  <div className="text-2xl font-bold">
                    {formatDate(room.createdAt, "PPP")}
                  </div>
                  <div className="text-sm text-base-content/70">Created</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Participants */}
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body">
            <h2 className="card-title mb-4">Participants</h2>

            {participants.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">👤</div>
                <p className="text-base-content/70">No participants yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center justify-between p-3 bg-base-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="avatar placeholder">
                        <div className="bg-neutral text-neutral-content rounded-full w-10">
                          <span className="text-sm">
                            {participant.userName?.[0]?.toUpperCase() ||
                              participant.userId?.[0]?.toUpperCase() ||
                              "?"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="font-semibold">
                          {participant.userName || "Unknown"}
                        </div>
                        <div className="text-sm text-base-content/70">
                          Participant
                        </div>
                      </div>
                    </div>

                    <div className="text-sm text-base-content/70">
                      {formatDate(participant.joinedAt, "PPP p")}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Room Actions */}
        <div className="mt-8 flex gap-4">
          <button className="btn btn-primary">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            Start Session
          </button>

          <button className="btn btn-outline">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Settings
          </button>
        </div>
      </div>
    </div>
  );
}
