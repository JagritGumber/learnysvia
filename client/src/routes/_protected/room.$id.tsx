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

export const Route = createFileRoute("/_protected/room/$id")({
  component: RoomPage,
});

function RoomPage() {
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
    const ws = new WebSocket(`ws://localhost:3000/ws/room/${id}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("Connected to room websocket");
      // Join with display name
      ws.send(
        JSON.stringify({
          type: "join",
          displayName: "Anonymous",
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
    <div className="min-h-[calc(100vh-64px)] bg-base-100 relative">
      {/* Main Content - Minimal */}
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-base-content mb-2">
            {room.name}
          </h1>
          <p className="text-lg text-base-content/70">
            Session in progress
          </p>
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
        <ShareRoomModal
          room={room}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}
