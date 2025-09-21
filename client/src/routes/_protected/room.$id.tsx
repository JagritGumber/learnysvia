import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShareRoomModal } from "@/components/modals/ShareRoomModal";
import { CreatePollModal } from "@/components/modals/CreatePollModal";
import { Icon } from "@iconify/react";
import { useRoomById } from "@/queries/roomById.query";
import { RoomParticipantsDrawer } from "@/components/room/RoomParticipantsDrawer";
import { useWebsocketStore } from "@/store/websocket";
import { api } from "@/utils/treaty";
import toast from "react-hot-toast";
import z from "zod";

const searchSchema = z.object({
  pid: z.string(),
  rid: z.string(),
});

export const Route = createFileRoute("/_protected/room/$id")({
  component: RoomPage,
  validateSearch: (search) => searchSchema.parse(search),
});

function RoomPage() {
  const { id } = Route.useParams();
  const { data, isPending, error } = useRoomById(id);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showParticipantsPanel, setShowParticipantsPanel] = useState(false);
  const [showCreatePollModal, setShowCreatePollModal] = useState(false);
  const search = Route.useSearch();

  const handleCreatePoll = async (questionId: string) => {
    try {
      // TODO: Implement poll creation API call
      console.log("Creating poll with question:", questionId);
      toast.success("Poll created successfully!");
    } catch (error) {
      console.error("Failed to create poll:", error);
      toast.error("Failed to create poll");
    }
  };

  const startWebsocketConnection = async () => {
    if (useWebsocketStore.getState().websocket) {
      console.log("websocket already subscribed");
      return;
    }
    console.log("Connecting websocket");

    try {
      const ws = api.ws.rooms({ id })({ pid: search.pid }).subscribe();
      useWebsocketStore.getState().setWebsocket(ws);
      ws.on("open", (event) => {
        console.log("WebSocket connected", event);
      });

      ws.on("message", (event) => {
        if (event.data[422]) {
          console.error("Data validation failed", event.data);
          return;
        }
        const data = event.data as unknown as (typeof event.data)[200];
        const channelSignal = event.data as unknown as string;

        if (data?.event === "participants:result") {
          useWebsocketStore.getState().setParticipants(data?.participants);
          useWebsocketStore.getState().setLoadingParticipants(false);
        } else if (
          data?.event === "participant:updated" ||
          channelSignal === "participants:notfresh"
        ) {
          useWebsocketStore.getState().fetchParticipants(search.rid);
        } else if (data?.event === "error") {
          useWebsocketStore.getState().setParticipantsError(data?.message);
          useWebsocketStore.getState().setLoadingParticipants(false);
          toast.error(`Participants error: ${data.message}`);
        }
      });

      ws.on("error", (error) => {
        console.error("WebSocket error:", error);
        useWebsocketStore
          .getState()
          .setParticipantsError("WebSocket connection error");
        toast.error("Connection error occurred");
      });

      ws.on("close", (event) => {
        console.log("WebSocket closed", event);
        useWebsocketStore.getState().setWebsocket(null);
        useWebsocketStore.getState().setParticipants([]);
        useWebsocketStore.getState().setParticipantsError(null);
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
      <div className="min-h-screen bg-base-100 flex flex-col items-center justify-center">
        <Icon icon="lineicons:ban" className="text-8xl mb-6 text-error" />
        <div className="text-center">
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
        <div className="flex-1 flex items-center justify-center p-4">
          {/* Host View - Empty State */}
          <div className="text-center max-w-md mx-auto">
            <div className="mb-8">
              <Icon
                icon="lineicons:document"
                className="text-6xl mb-6 text-primary mx-auto"
              />
              <h1 className="text-3xl font-bold text-base-content mb-2">
                Start Your First Poll
              </h1>
              <p className="text-lg text-base-content/70 mb-4">
                Create engaging polls for your session participants
              </p>
              <p className="text-base-content/70 mb-6">
                Select questions from your catalogs to get started
              </p>
            </div>

            {/* Action Buttons for Host */}
            <div className="flex flex-col gap-4">
              <button
                className="btn btn-primary btn-lg"
                onClick={() => setShowCreatePollModal(true)}
              >
                <Icon icon="lineicons:plus" className="w-5 h-5 mr-2" />
                Create Poll
              </button>

              <button
                className="btn btn-outline btn-lg"
                onClick={() => setShowShareModal(true)}
              >
                <Icon icon="lineicons:share" className="w-5 h-5 mr-2" />
                Share Room
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
      <RoomParticipantsDrawer
        setShowParticipantsPanel={setShowParticipantsPanel}
        roomId={search.rid}
      />

      {showShareModal && data.room && (
        <ShareRoomModal
          room={data.room}
          onClose={() => setShowShareModal(false)}
        />
      )}

      <CreatePollModal
        isOpen={showCreatePollModal}
        onClose={() => setShowCreatePollModal(false)}
        onCreatePoll={handleCreatePoll}
      />
    </div>
  );
}
