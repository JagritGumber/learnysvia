import { createFileRoute } from "@tanstack/react-router";
import { CreateRoomModal } from "../../../components/modals/CreateRoomModal";
import { RoomCard } from "../../../components/room/RoomCard";
import { Icon } from "@iconify/react";
import { useRooms } from "@/queries/rooms.query";
import { useRoomMutations } from "@/mutations/rooms.mutations";
import { useState } from "react";

export const Route = createFileRoute("/_protected/_dashboard/rooms")({
  component: Rooms,
});

function Rooms() {
  const { data: rooms, isPending } = useRooms();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { deleteRoom, createRoom } = useRoomMutations();

  if (isPending) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-base-200 flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-base-200">
      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-base-content mb-2">
              Question Rooms
            </h1>
            <p className="text-base-content/70">
              Create and manage your Question rooms
            </p>
          </div>
          <button
            className="btn btn-primary btn-md"
            onClick={() => setShowCreateModal(true)}
          >
            <Icon icon="lineicons:plus" className="w-5 h-5 mr-2" />
            Create Room
          </button>
        </div>

        {/* Rooms Grid */}
        {rooms?.length === 0 ? (
          <div className="text-center py-16">
            <Icon
              icon="lineicons:home-4"
              className="text-8xl mb-6 text-base-content/50"
            />
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
            {rooms?.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onDelete={deleteRoom.mutateAsync}
              />
            ))}
          </div>
        )}

        {showCreateModal && (
          <CreateRoomModal
            onClose={() => setShowCreateModal(false)}
            onCreate={createRoom.mutateAsync}
          />
        )}
      </div>
    </div>
  );
}
