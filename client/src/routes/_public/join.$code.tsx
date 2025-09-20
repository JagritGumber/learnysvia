import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { Icon } from "@iconify/react";
import { api } from "../../utils/treaty";
import { useRoomMutations } from "../../mutations/rooms";
import { authClient } from "../../utils/auth-client";

export const Route = createFileRoute("/_public/join/$code")({
  component: JoinRoomPage,
});

function JoinRoomPage() {
  const { code } = Route.useParams();
  const navigate = useNavigate();
  const [isJoining, setIsJoining] = useState(false);

  const { joinRoom, startRoom } = useRoomMutations();
  const { data: session } = authClient.useSession();

  const handleJoinRoom = async () => {
    if (!session) {
      toast.error("Please sign in to join the room");
      return;
    }

    try {
      setIsJoining(true);

      // First, check if the user is the room owner by trying to get room details
      const roomResponse = await api.api
        .rooms({
          id: code,
        })
        .get();

      let isRoomOwner = false;
      let roomData = null;

      if (roomResponse.status === 200) {
        roomData = roomResponse.data;
        // Check if current user is the room owner
        isRoomOwner = roomData?.room?.createdBy === session.user.id;
      }

      // If user is the room owner, start the test first
      if (isRoomOwner && roomData?.room?.status === "not_started") {
        await startRoom.mutateAsync({
          id: roomData.room.id,
        });
      }

      // Join the room
      const joinData = await joinRoom.mutateAsync({
        code: code,
      });

      toast.success(
        isRoomOwner
          ? "Test started and joined successfully!"
          : "Joined room successfully!"
      );

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
              {session
                ? "Click to join the room"
                : "Please sign in to join the room"}
            </p>

            <div className="modal-action justify-center">
              <button
                className="btn btn-primary btn-lg"
                onClick={handleJoinRoom}
                disabled={!session || isJoining}
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
