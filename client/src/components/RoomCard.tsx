import { useState } from "react";
import { type Room } from "../utils/rooms-api";
import { ShareRoomModal } from "./ShareRoomModal";
import { roomsApi } from "../utils/rooms-api";
import { toast } from "react-hot-toast";
import { useNavigate } from "@tanstack/react-router";
import { Icon } from "@iconify/react";

interface RoomCardProps {
  room: Room;
  onDelete: ({ id }: { id: string }) => Promise<void>;
}

export function RoomCard({ room, onDelete }: RoomCardProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [joining, setJoining] = useState(false);
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${room.name}"?`)) return;

    setDeleting(true);
    try {
      await onDelete({ id: room.id });
    } finally {
      setDeleting(false);
    }
  };

  const handleJoin = async () => {
    setJoining(true);
    try {
      const result = await roomsApi.joinRoom(room.code);
      toast.success(`Successfully joined room "${room.name}"!`);
      // Navigate to room management interface
      navigate({ to: "/room/$id", params: { id: result.room.id } });
    } catch (error) {
      console.error("Failed to join room:", error);
      toast.error("Failed to join room. Please try again.");
    } finally {
      setJoining(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getParticipantText = () => {
    // This would come from the room data in a real implementation
    // For now, we'll show a placeholder
    return `${Math.floor(Math.random() * 10)}/${room.maxParticipants}`;
  };

  return (
    <>
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body">
          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="card-title text-lg font-bold truncate">
                {room.name}
              </h3>
              <p className="text-sm text-base-content/70 mt-1">
                Code:{" "}
                <span className="font-mono font-semibold">{room.code}</span>
              </p>
            </div>
            <div className="flex gap-2 ml-2">
              <button
                className="btn btn-ghost btn-sm btn-circle"
                onClick={() => setShowShareModal(true)}
                title="Share Room"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                  />
                </svg>
              </button>
              <div className="dropdown dropdown-end">
                <button
                  className="btn btn-ghost btn-sm btn-circle"
                  title="More options"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                    />
                  </svg>
                </button>
                <ul className="dropdown-content z-[1] menu p-2 bg-base-100 rounded-box w-52">
                  <li>
                    <button className="text-info w-full text-left">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      View Details
                    </button>
                  </li>
                  <li>
                    <button className="text-warning w-full text-left">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Edit Settings
                    </button>
                  </li>
                  <li>
                    <button
                      className="text-error w-full text-left"
                      onClick={handleDelete}
                      disabled={deleting}
                    >
                      {deleting ? (
                        <div className="loading loading-spinner loading-sm"></div>
                      ) : (
                        <Icon icon="lineicons:trash-3" />
                      )}
                      Delete Room
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Description */}
          {room.description && (
            <p className="text-sm text-base-content/80 mb-3 line-clamp-2">
              {room.description}
            </p>
          )}

          {/* Stats */}
          <div className="flex justify-between items-center text-sm text-base-content/70 mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
                <span>{getParticipantText()}</span>
              </div>
              <div className="flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{formatDate(room.createdAt.toString())}</span>
              </div>
            </div>
            <div
              className={`badge ${room.isPublic ? "badge-success" : "badge-warning"}`}
            >
              {room.isPublic ? "Public" : "Private"}
            </div>
          </div>

          {/* Actions */}
          <div className="card-actions justify-end gap-2">
            <button
              className="btn btn-success btn-sm"
              onClick={handleJoin}
              disabled={joining}
            >
              {joining ? (
                <div className="loading loading-spinner loading-sm"></div>
              ) : (
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
              )}
              {joining ? "Joining..." : "Join"}
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowShareModal(true)}
            >
              <Icon icon="lineicons:share" />
              Share
            </button>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <ShareRoomModal room={room} onClose={() => setShowShareModal(false)} />
      )}
    </>
  );
}
