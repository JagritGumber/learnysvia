import { useState } from "react";
import { type Room } from "../utils/rooms-api";
import { toast } from "react-hot-toast";

interface ShareRoomModalProps {
  room: Room;
  onClose: () => void;
}

export function ShareRoomModal({ room, onClose }: ShareRoomModalProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/join/${room.code}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error("Failed to copy link");
    }
  };

  const shareViaWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${room.name}`,
          text: `Join my room: ${room.name}`,
          url: shareUrl,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-base-content">Share Room</h2>
            <button
              onClick={onClose}
              className="btn btn-ghost btn-sm btn-circle"
            >
              ✕
            </button>
          </div>

          {/* Room Info */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-base-content mb-2">
              {room.name}
            </h3>
            {room.description && (
              <p className="text-base-content/70 text-sm mb-4">
                {room.description}
              </p>
            )}
            <div className="bg-base-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-base-content">
                  Room Code:
                </span>
                <span className="font-mono font-bold text-primary">
                  {room.code}
                </span>
              </div>
              <div className="text-xs text-base-content/60">
                Share this code or use the link below
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-base-content mb-4">
              QR Code
            </h4>
            <div className="flex justify-center">
              <img
                src={qrCodeUrl}
                alt={`QR Code for ${room.name}`}
                className="w-48 h-48 border-2 border-base-300 rounded-lg"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  toast.error("Failed to load QR code");
                }}
              />
            </div>
            <p className="text-sm text-base-content/70 text-center mt-2">
              Scan to join the room
            </p>
          </div>

          {/* Share Link */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-base-content mb-4">
              Share Link
            </h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="input input-bordered flex-1 text-sm"
              />
              <button
                onClick={copyToClipboard}
                className={`btn ${copied ? "btn-success" : "btn-primary"}`}
              >
                {copied ? (
                  <>
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Copied
                  </>
                ) : (
                  <>
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
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Share Options */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-base-content mb-4">
              Share Options
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={shareViaWebShare}
                className="btn btn-outline btn-primary"
              >
                <svg
                  className="w-4 h-4 mr-2"
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
                Share
              </button>
              <button
                onClick={() => {
                  const subject = `Join my room: ${room.name}`;
                  const body = `Hi! I'd like to invite you to join my room "${room.name}".\n\nRoom Code: ${room.code}\n\nJoin here: ${shareUrl}`;
                  window.open(
                    `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
                  );
                }}
                className="btn btn-outline btn-secondary"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Email
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-base-200 rounded-lg p-4">
            <h5 className="font-semibold text-base-content mb-2">
              How to join:
            </h5>
            <ol className="text-sm text-base-content/70 space-y-1">
              <li>1. Share the room code or QR code with participants</li>
              <li>
                2. Participants can join using the code or scanning the QR
              </li>
              <li>3. Anonymous users can join if the room allows it</li>
              <li>4. Authenticated users get additional features</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
