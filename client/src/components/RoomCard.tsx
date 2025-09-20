import { useState } from "react";
import { type Room } from "../utils/rooms-api";
import { ShareRoomModal } from "./ShareRoomModal";
import { useNavigate } from "@tanstack/react-router";
import { Icon } from "@iconify/react";

interface RoomCardProps {
  room: Room;
  onDelete: ({ id }: { id: string }) => Promise<void>;
}

export function RoomCard({ room, onDelete }: RoomCardProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
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

  const handleNavigateToJoin = () => {
    navigate({
      to: "/join/$code",
      params: { code: room.code },
      search: { rid: room.id },
    });
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
          <div className="flex justify-end items-center text-sm text-base-content/70 mb-4">
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
              onClick={handleNavigateToJoin}
            >
              <Icon icon="lineicons:location-arrow-right" />
              Join
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
