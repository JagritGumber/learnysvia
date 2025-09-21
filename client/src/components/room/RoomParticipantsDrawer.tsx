import { Icon } from "@iconify/react";
import { useWebsocketStore } from "@/store/websocket";
import { useEffect } from "react";

export const RoomParticipantsDrawer = ({
  setShowParticipantsPanel,
  roomId,
}: {
  setShowParticipantsPanel: React.Dispatch<React.SetStateAction<boolean>>;
  roomId: string;
}) => {
  const {
    participants,
    isLoadingParticipants,
    participantsError,
    fetchParticipants,
  } = useWebsocketStore();

  // Refetch participants when drawer opens (if we don't have any yet)
  useEffect(() => {
    if (
      roomId &&
      participants.length === 0 &&
      !isLoadingParticipants &&
      !participantsError
    ) {
      fetchParticipants(roomId);
    }
  }, [
    roomId,
    participants.length,
    isLoadingParticipants,
    participantsError,
    fetchParticipants,
  ]);

  const getRoleIcon = (role: string | null) => {
    switch (role) {
      case "host":
        return "lineicons:crown";
      case "co_host":
        return "lineicons:star-fat";
      default:
        return "lineicons:user";
    }
  };

  const getRoleColor = (role: string | null) => {
    switch (role) {
      case "host":
        return "text-warning";
      case "co_host":
        return "text-info";
      default:
        return "text-base-content";
    }
  };

  return (
    <div className="drawer-side z-50">
      <label
        htmlFor="participants-drawer"
        aria-label="close sidebar"
        className="drawer-overlay"
        onClick={() => setShowParticipantsPanel(false)}
      />

      <div className="menu p-4 w-80 min-h-full bg-base-100 text-base-content border-l border-base-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            Participants ({participants.length})
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchParticipants(roomId)}
              disabled={isLoadingParticipants}
              className="btn btn-ghost btn-sm btn-circle"
              title="Refresh participants"
            >
              <Icon
                icon="lineicons:refresh"
                className={`w-4 h-4 ${isLoadingParticipants ? "animate-spin" : ""}`}
              />
            </button>
            <button
              onClick={() => setShowParticipantsPanel(false)}
              className="btn btn-ghost btn-sm btn-circle"
            >
              <Icon icon="lineicons:close" className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoadingParticipants && (
          <div className="text-center text-base-content/70 py-8">
            <div className="loading loading-spinner loading-md mx-auto mb-4"></div>
            <p>Loading participants...</p>
          </div>
        )}

        {/* Error State */}
        {participantsError && (
          <div className="text-center text-error py-8">
            <Icon
              icon="lineicons:warning"
              className="w-12 h-12 mx-auto mb-4 opacity-50"
            />
            <p className="mb-4">{participantsError}</p>
            <button
              className="btn btn-sm btn-outline"
              onClick={() => fetchParticipants(roomId)}
            >
              Retry
            </button>
          </div>
        )}

        {/* Participants List */}
        {!isLoadingParticipants &&
          !participantsError &&
          participants.length > 0 && (
            <div className="space-y-2">
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-base-200 hover:bg-base-300 transition-colors"
                >
                  <div className="avatar placeholder flex">
                    <div className="bg-neutral text-neutral-content rounded-full p-2">
                      <Icon
                        icon={getRoleIcon(participant.role)}
                        className={`w-5 h-5 ${getRoleColor(participant.role)}`}
                      />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-base-content truncate">
                        {participant.displayName || "Anonymous"}
                      </p>
                      {participant.role && (
                        <span
                          className={`badge badge-xs badge-${participant.role === "host" ? "warning" : participant.role === "co_host" ? "info" : "neutral"}`}
                        >
                          {participant.role}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-base-content/70">
                      {participant.participantType === "authenticated"
                        ? "User"
                        : "Guest"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

        {/* Empty State */}
        {!isLoadingParticipants &&
          !participantsError &&
          participants.length === 0 && (
            <div className="text-center text-base-content/70 py-8">
              <Icon
                icon="lineicons:users"
                className="w-12 h-12 mx-auto mb-4 opacity-50"
              />
              <p>No participants yet</p>
              <p className="text-sm mt-2">
                Participants will appear here when they join
              </p>
            </div>
          )}
      </div>
    </div>
  );
};
