import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShareRoomModal } from "@/components/ShareRoomModal";
import { Icon } from "@iconify/react";
import { useRoomById } from "@/queries/roomById";
import { ParticipantsDrawer } from "@/components/ParticipantsDrawer";
import { useWebsocketStore } from "@/store/websocket";
import { api } from "@/utils/treaty";
import toast from "react-hot-toast";

export const Route = createFileRoute("/_public/room/$id")({
  component: RoomPage,
});

function RoomPage() {
  const { id } = Route.useParams();
  const { data, isPending, error } = useRoomById(id);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showParticipantsPanel, setShowParticipantsPanel] = useState(false);

  const startWebsocketConnection = async () => {
    if (useWebsocketStore.getState().websocket) {
      console.log("websocket already subscribed");
      return;
    }
    console.log("Connecting websocket");

    try {
      const ws = api.ws.rooms({ id }).subscribe();
      useWebsocketStore.getState().setWebsocket(ws);
      ws.on("open", (event) => {
        console.log(event);
      });
    } catch (error) {
      console.error("Failed to connect to the room", error);
      toast.error("Failed to connect to the room, Please try again later");
    }
  };

  useEffect(() => {
    startWebsocketConnection();
  }, []);

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
    <div className="drawer drawer-start min-h-[calc(100svh-6rem)] overflow-hidden bg-base-100 flex flex-col">
      <input
        id="participants-drawer"
        type="checkbox"
        className="drawer-toggle"
        checked={showParticipantsPanel}
        onChange={() => setShowParticipantsPanel(!showParticipantsPanel)}
      />

      {/* Main Content */}
      <div className="drawer-content flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto">
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
        </div>

        {/* Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-base-200 border-t border-base-300 p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-center">
            <label
              htmlFor="participants-drawer"
              className="btn btn-neutral btn-circle btn-sm"
            >
              <Icon icon="lineicons:users" className="size-6" />
            </label>
          </div>
        </div>
      </div>
      <ParticipantsDrawer setShowParticipantsPanel={setShowParticipantsPanel} />

      {showShareModal && data.room && (
        <ShareRoomModal
          room={data.room}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}
