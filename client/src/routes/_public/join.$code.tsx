import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Icon } from "@iconify/react";

export const Route = createFileRoute("/_public/join/$code")({
  component: JoinRoomPage,
});

function JoinRoomPage() {
  const { code } = Route.useParams();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    // Focus the input when component mounts
    const input = document.getElementById(
      "displayNameInput"
    ) as HTMLInputElement;
    if (input) input.focus();
  }, []);

  const handleJoinRoom = async () => {
    if (!displayName.trim()) return;

    try {
      setIsJoining(true);

      // Join the room anonymously via backend
      const response = await fetch(`/api/rooms/${code}/join-anonymous`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          displayName: displayName.trim(),
        }),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Room not found");
        } else if (response.status === 409) {
          throw new Error("Room is full");
        } else if (response.status === 410) {
          throw new Error("Room has expired");
        } else {
          throw new Error("Failed to join room");
        }
      }

      const joinData = await response.json();

      toast.success("Joined room successfully!");

      // Redirect to the room page
      navigate({
        to: "/room/$id",
        params: { id: joinData.room.id },
        replace: true,
      });
    } catch (err: any) {
      console.error("Error joining room:", err);
      toast.error(err.message || "Failed to join room");
    } finally {
      setIsJoining(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && displayName.trim()) {
      handleJoinRoom();
    }
  };

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
      <div className="modal modal-open">
        <div className="modal-box">
          <div className="text-center">
            <Icon
              icon="lineicons:room"
              className="text-6xl mb-4 text-primary mx-auto"
            />
            <h3 className="font-bold text-lg mb-2">Join Room</h3>
            <p className="text-base-content/70 mb-6">
              Enter your name to join the room
            </p>

            <div className="form-control mb-6">
              <input
                id="displayNameInput"
                type="text"
                placeholder="Your name"
                className="input input-bordered input-lg text-center"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                onKeyPress={handleKeyPress}
                maxLength={50}
                disabled={isJoining}
              />
            </div>

            <div className="modal-action justify-center">
              <button
                className="btn btn-primary btn-lg"
                onClick={handleJoinRoom}
                disabled={!displayName.trim() || isJoining}
              >
                {isJoining ? (
                  <>
                    <div className="loading loading-spinner loading-sm"></div>
                    Joining...
                  </>
                ) : (
                  <>
                    <Icon icon="lineicons:enter" className="w-5 h-5 mr-2" />
                    Join Room
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
