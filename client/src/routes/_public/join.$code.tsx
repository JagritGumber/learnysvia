import { createFileRoute } from "@tanstack/react-router";
import { useRoomMutations } from "../../mutations/rooms";
import { authClient } from "../../utils/auth-client";
import { useState } from "react";

export const Route = createFileRoute("/_public/join/$code")({
  component: JoinRoomPage,
});

function JoinRoomPage() {
  const { code } = Route.useParams();
  const { joinRoom } = useRoomMutations();
  const session = authClient.useSession();
  const [username, setUsername] = useState("");

  const handleJoinWithUsername = async () => {
    await authClient.signIn.anonymous();
    if (username.trim()) {
      await joinRoom.mutateAsync({ code, name: username.trim(), type: "anon" });
    }
  };

  // If user has session, proceed with join
  if (session.data?.user && !joinRoom.isPending && !joinRoom.isSuccess) {
    joinRoom.mutateAsync({ code, name: session.data.user.name, type: "auth" });
  }

  // If no session, show username form
  if (!session.data?.user) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-base-100 rounded-lg shadow-xl max-w-md w-full border border-base-300">
          <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-base-content">
                Join Room
              </h2>
            </div>

            {/* Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleJoinWithUsername();
              }}
              className="space-y-4"
            >
              {/* Username Input */}
              <div className="form-control flex flex-col gap-1">
                <label className="label">
                  <span className="label-text font-medium">Username *</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  className="input input-bordered w-full"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  maxLength={50}
                  autoFocus
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  className="btn btn-ghost flex-1"
                  disabled={joinRoom.isPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                  disabled={joinRoom.isPending || !username.trim()}
                >
                  {joinRoom.isPending ? (
                    <>
                      <div className="loading loading-spinner loading-sm"></div>
                      Joining...
                    </>
                  ) : (
                    "Join Room"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
      <div className="loading loading-spinner loading-md"></div>
    </div>
  );
}
