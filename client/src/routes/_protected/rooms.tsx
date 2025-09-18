import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { roomsApi, type Room } from "../../utils/rooms-api";
import { CreateRoomModal } from "../../components/CreateRoomModal";
import { RoomCard } from "../../components/RoomCard";
import { toast } from "react-hot-toast";

export const Route = createFileRoute("/_protected/rooms")({
  component: Rooms,
});

function Rooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      const userRooms = await roomsApi.getRooms();
      setRooms(userRooms);
    } catch (error) {
      console.error("Failed to load rooms:", error);
      toast.error("Failed to load rooms");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async (roomData: any) => {
    try {
      const result = await roomsApi.createRoom(roomData);
      setRooms((prev) => [result.room, ...prev]);
      setShowCreateModal(false);
      toast.success("Room created successfully!");
    } catch (error) {
      console.error("Failed to create room:", error);
      toast.error("Failed to create room");
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    try {
      await roomsApi.deleteRoom(roomId);
      setRooms((prev) => prev.filter((room) => room.id !== roomId));
      toast.success("Room deleted successfully!");
    } catch (error) {
      console.error("Failed to delete room:", error);
      toast.error("Failed to delete room");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-base-100 flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-base-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-base-content mb-2">
              My Rooms
            </h1>
            <p className="text-base-content/70">
              Create and manage your collaborative rooms
            </p>
          </div>
          <button
            className="btn btn-primary btn-lg"
            onClick={() => setShowCreateModal(true)}
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create Room
          </button>
        </div>

        {/* Rooms Grid */}
        {rooms.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-8xl mb-6">🏠</div>
            <h2 className="text-2xl font-semibold text-base-content mb-4">
              No rooms yet
            </h2>
            <p className="text-base-content/70 mb-6 max-w-md mx-auto">
              Create your first room to start collaborating with others. Share
              the room code or QR code for easy access.
            </p>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => setShowCreateModal(true)}
            >
              Create Your First Room
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} onDelete={handleDeleteRoom} />
            ))}
          </div>
        )}

        {/* Create Room Modal */}
        {showCreateModal && (
          <CreateRoomModal
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreateRoom}
          />
        )}
      </div>
    </div>
  );
}
