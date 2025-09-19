import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { type Room } from "../../utils/rooms-api";
import { ShareRoomModal } from "../../components/ShareRoomModal";
import { Icon } from "@iconify/react";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    loadRoomData();
  }, [id]);

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
    } catch (err) {
      console.error("Failed to load room:", err);
      setError("Failed to load room data");
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
    <div className="min-h-screen bg-base-100 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="mb-8">
          <Icon
            icon="lineicons:room"
            className="text-6xl mb-6 text-primary mx-auto"
          />
          <h1 className="text-3xl font-bold text-base-content mb-2">
            {room.name}
          </h1>
          <p className="text-lg text-base-content/70 mb-4">
            Welcome, {search.displayName || "Guest"}!
          </p>
          <p className="text-base-content/70">Room ID: {room.id}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4">
          <button
            className="btn btn-primary btn-lg"
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

      {showShareModal && room && (
        <ShareRoomModal room={room} onClose={() => setShowShareModal(false)} />
      )}
    </div>
  );
}
