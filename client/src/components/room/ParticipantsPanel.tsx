import { Icon } from "@iconify/react";
import { useWebsocketStore } from "@/store/websocket";
import { useRoomById } from "@/queries/roomById.query";
import { useParams } from "@tanstack/react-router";

export function ParticipantsPanel() {
  const participants = useWebsocketStore((state) => state.participants);
  const kickParticipant = useWebsocketStore((state) => state.kickParticipant);
  const { id: roomId } = useParams({ from: "/_protected/room/$id" });
  const { data: roomData } = useRoomById(roomId);

  const isHost =
    roomData?.room?.createdBy ===
    participants?.find((p) => p.role === "host")?.userId;

  return (
    <div className="w-80 bg-base-100 border-l border-base-300 flex flex-col">
      <div className="p-4 border-b border-base-300">
        <h3 className="text-lg font-semibold text-base-content">
          Participants
        </h3>
        <div className="text-sm text-base-content/60 mt-1">
          {participants?.length || 0} online
        </div>
      </div>
      <div className="flex-1 p-2 max-h-[calc(100vh-200px)] overflow-y-auto">
        {participants && participants.length > 0 ? (
          participants.map((participant) => (
            <div
              key={participant.id}
              className="flex items-center gap-3 p-3 rounded-lg mb-2 hover:bg-base-200 transition-colors"
            >
              <div className="avatar placeholder">
                <div className="bg-neutral text-neutral-content rounded-full w-8 h-8 flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {participant.displayName?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-base-content truncate">
                  {participant.displayName || "Unknown User"}
                </div>
                <div className="text-xs text-base-content/60 capitalize">
                  {participant.role}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {isHost && participant.role !== "host" && (
                  <button
                    className="btn btn-ghost btn-xs btn-circle"
                    onClick={() => kickParticipant(participant.id)}
                    title="Kick participant"
                  >
                    <Icon icon="lineicons:close" className="size-3" />
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full text-center p-4">
            <div>
              <Icon
                icon="lineicons:users"
                className="text-4xl mb-4 text-base-content/40 mx-auto"
              />
              <p className="text-sm text-base-content/60">No participants</p>
              <p className="text-xs text-base-content/40 mt-1">
                Waiting for others to join
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
