import { useState } from "react";
import { ShareRoomModal } from "../modals/ShareRoomModal";
import { useNavigate } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { SelectRoom } from "@/shared/types/room";

interface RoomCardProps {
  room: SelectRoom;
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
    });
  };

  return (
    <>
      <div className="card bg-base-200 border border-base-300 hover:bg-base-300/50 transition-colors duration-200">
        <div className="card-body p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="card-title text-lg font-bold truncate text-base-content">
                {room.name}
              </h3>
              <p className="text-sm text-base-content/70 mt-1">
                Code:{" "}
                <span className="font-mono font-semibold bg-base-100 px-2 py-1 rounded border">
                  {room.code}
                </span>
              </p>
            </div>
            <div className="flex gap-2 ml-2">
              <button
                className="btn btn-ghost btn-sm btn-circle bg-base-100 hover:bg-base-200"
                onClick={() => setShowShareModal(true)}
                title="Share Room"
              >
                <Icon icon="lineicons:share" />
              </button>
              <div className="dropdown dropdown-end">
                <button
                  className="btn btn-ghost btn-sm btn-circle bg-base-100 hover:bg-base-200"
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
                <ul className="dropdown-content z-[1] menu p-2 bg-base-100 rounded-box w-52 border border-base-300">
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
            <p className="text-sm text-base-content/80 mb-4 line-clamp-2 p-3 rounded-lg bg-base-100/50">
              {room.description}
            </p>
          )}

          {/* Stats */}
          <div className="flex justify-between items-center text-sm text-base-content/70 mb-4">
            <div className="flex items-center gap-2">
              <Icon icon="lineicons:users" className="w-4 h-4" />
              <span>Room</span>
            </div>
            <div
              className={`badge ${room.isPublic ? "badge-success" : "badge-warning"} border-0`}
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
