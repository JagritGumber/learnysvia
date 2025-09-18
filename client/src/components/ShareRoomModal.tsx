import { useState } from "react";
import { type Room } from "../utils/rooms-api";
import { toast } from "react-hot-toast";
import { Icon } from "@iconify/react";

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
      <div className="bg-base-100 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Room Info */}
              <div>
                <h3 className="text-lg font-semibold text-base-content mb-2">
                  {room.name}
                </h3>
                {room.description && (
                  <p className="text-base-content/70 text-sm mb-4">
                    {room.description}
                  </p>
                )}
                <div className="bg-base-100 rounded-lg">
                  <div className="mb-2">
                    <span className="text-sm font-medium text-base-content block mb-2">
                      Room Code:
                    </span>
                    <div className="bg-base-100 rounded p-3 border-2 border-dashed border-base-content/20">
                      <span className="font-mono font-bold text-base-content text-lg break-all select-all">
                        {room.code}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-base-content/60">
                    Share this code or use the link below
                  </div>
                </div>
              </div>

              {/* QR Code */}
              <div>
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
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Share Link */}
              <div>
                <h4 className="text-lg font-semibold text-base-content mb-4">
                  Share Link
                </h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="input input-bordered flex-1 text-sm overflow-hidden text-ellipsis"
                  />
                  <button
                    onClick={copyToClipboard}
                    className={`btn ${copied ? "btn-success" : "btn-primary"}`}
                  >
                    {copied ? (
                      <>
                        <Icon icon="lineicons:check" className="w-4 h-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Icon icon="ph:copy" className="w-4 h-4 mr-1" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Share Options */}
              <div>
                <h4 className="text-lg font-semibold text-base-content mb-4">
                  Share Options
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={shareViaWebShare}
                    className="btn btn-outline btn-primary"
                  >
                    <Icon icon="lineicons:share" className="w-4 h-4 mr-2" />
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
                    <Icon icon="lineicons:envelope" className="w-4 h-4 mr-2" />
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
      </div>
    </div>
  );
}
