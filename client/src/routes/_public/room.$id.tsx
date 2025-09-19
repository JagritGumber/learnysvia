import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  roomsApi,
  type Room,
  type RoomParticipant,
} from "../../utils/rooms-api";
import { ShareRoomModal } from "../../components/ShareRoomModal";
import { toast } from "react-hot-toast";
import { Icon } from "@iconify/react";
import { env } from "@/env";
import z from "zod";

const searchSchema = z.object({
  displayName: z.string().min(1).optional(),
});

export const Route = createFileRoute("/_public/room/$id")({
  component: RoomPage,
  validateSearch: (search) => searchSchema.parse(search),
});

function RoomPage() {
  const search = Route.useSearch();
  const { id } = Route.useParams();
  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<RoomParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
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
    const displayName = search.displayName;
    const serverUrl = env.VITE_SERVER_URL || "localhost:3000";
    const wsUrl = serverUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
    const ws = new WebSocket(`ws://${wsUrl}/ws/room/${id}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("Connected to room websocket");
      // Join with display name from URL params or default
      ws.send(
        JSON.stringify({
          type: "join",
          displayName: displayName,
          userId: `anon_${Date.now()}`, // Generate anonymous user ID
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
      case "typing_start":
        // Handle typing indicator
        break;
      case "typing_stop":
        // Handle typing indicator
        break;
    }
  };

  const loadRoomData = async () => {
    try {
      setLoading(true);
      // For anonymous rooms, we'll create a mock room for now
      // In a real implementation, you'd fetch room data from the server
      setRoom({
        id: id,
        name: "Anonymous Room",
        description: "A room for anonymous users",
        code: id,
        createdBy: "Anonymous",
        isPublic: true,
        maxParticipants: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: null,
      });
      setParticipants([]);
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
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <Icon icon="lineicons:ban" className="text-8xl mb-6 text-error" />
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
    <div className="min-h-screen bg-base-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-base-200 border-r border-base-300 flex flex-col lg:block">
        <div className="p-4 border-b border-base-300">
          <h2 className="text-lg font-semibold text-base-content">
            Room Tools
          </h2>
        </div>
        <div className="p-4 flex-1">
          <button className="btn btn-primary w-full">
            <Icon icon="lineicons:plus" className="w-5 h-5 mr-2" />
            New Poll
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed top-16 left-4 z-40">
        <button className="btn btn-circle btn-primary">
          <Icon icon="lineicons:menu" className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative lg:ml-0 ml-16">
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-base-content mb-2">
              {room.name}
            </h1>
            <p className="text-lg text-base-content/70 mb-4">
              Welcome, {search.displayName}!
            </p>
            <p className="text-base-content/70">Session in progress</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              className="btn btn-primary btn-lg"
              onClick={() => setShowParticipants(true)}
            >
              <Icon icon="lineicons:user-multiple-4" className="w-5 h-5 mr-2" />
              Participants ({participants.length})
            </button>

            <button
              className="btn btn-outline btn-lg"
              onClick={() => setShowShareModal(true)}
            >
              <Icon icon="lineicons:share" className="w-5 h-5 mr-2" />
              Share Room
            </button>

            <button className="btn btn-outline btn-lg">
              <Icon icon="lineicons:cog" className="w-5 h-5 mr-2" />
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* Participants Sidebar */}
      {showParticipants && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowParticipants(false)}
          />
          {/* Sidebar */}
          <div className="absolute right-0 top-0 h-full w-80 bg-base-100 shadow-xl transform transition-transform duration-300 ease-in-out">
            <div className="flex items-center justify-between p-4 border-b border-base-300">
              <h2 className="text-xl font-semibold text-base-content">
                Participants ({participants.length})
              </h2>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setShowParticipants(false)}
              >
                <Icon icon="lineicons:close" className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              {participants.length === 0 ? (
                <div className="text-center py-8">
                  <Icon
                    icon="lineicons:user"
                    className="text-4xl mb-4 text-base-content/50 mx-auto"
                  />
                  <p className="text-base-content/70">No participants yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {participants.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-base-200 transition-colors"
                    >
                      <div className="avatar placeholder">
                        <div className="bg-neutral text-neutral-content rounded-full w-10">
                          <span className="text-sm">
                            {participant.userName?.[0]?.toUpperCase() ||
                              participant.userId?.[0]?.toUpperCase() ||
                              "?"}
                          </span>
                        </div>
                      </div>
                      <div className="font-medium text-base-content">
                        {participant.userName || "Unknown"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Share Room Modal */}
      {showShareModal && room && (
        <ShareRoomModal room={room} onClose={() => setShowShareModal(false)} />
      )}
    </div>
  );
}
