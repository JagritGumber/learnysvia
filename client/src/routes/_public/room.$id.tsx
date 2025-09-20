import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ShareRoomModal } from "../../components/ShareRoomModal";
import { Icon } from "@iconify/react";
import { useRoomById } from "@/queries/roomById";

export const Route = createFileRoute("/_public/room/$id")({
  component: RoomPage,
});

function RoomPage() {
  const { id } = Route.useParams();
  const { data, isPending, error } = useRoomById(id);
  const [showShareModal, setShowShareModal] = useState(false);

  if (isPending) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (error || !data?.room) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <Icon icon="lineicons:ban" className="text-8xl mb-6 text-error" />
          <h2 className="text-2xl font-semibold text-base-content mb-4">
            {typeof error === "string"
              ? error
              : error?.message || "Room not found"}
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
            {data.room.name}
          </h1>
          <p className="text-lg text-base-content/70 mb-4">
            Welcome, {"Guest"}!
          </p>
          <p className="text-base-content/70">Room ID: {data.room.id}</p>
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

      {showShareModal && data.room && (
        <ShareRoomModal
          room={data.room}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}
