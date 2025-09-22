import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShareRoomModal } from "@/components/modals/ShareRoomModal";
import { CreatePollModal } from "@/components/modals/CreatePollModal";
import { Icon } from "@iconify/react";
import { useRoomById } from "@/queries/roomById.query";
import { useRoomPolls } from "@/queries/roomPolls.query";
import { RoomParticipantsDrawer } from "@/components/room/RoomParticipantsDrawer";
import { useWebsocketStore } from "@/store/websocket";
import { api } from "@/utils/treaty";
import toast from "react-hot-toast";
import z from "zod";
import { usePollMutations } from "@/mutations/polls.mutations";
import { usePollById } from "@/queries/pollById.query";
import { authClient } from "@/utils/auth-client";

const searchSchema = z.object({
  pid: z.string(),
  rid: z.string(),
});

export const Route = createFileRoute("/_protected/room/$id")({
  component: RoomPage,
  validateSearch: (search) => searchSchema.parse(search),
});

function RoomPage() {
  const { id } = Route.useParams();
  const search = Route.useSearch();
  const { data, isPending, error } = useRoomById(id);
  const {
    data: pollsData,
    isPending: pollsPending,
    error: pollsError,
  } = useRoomPolls(search.rid);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showParticipantsPanel, setShowParticipantsPanel] = useState(false);
  const [showCreatePollModal, setShowCreatePollModal] = useState(false);
  const [selectedPollId, setSelectedPollId] = useState<string | null>(null);
  const { createPoll, submitPollAnswer, deletePoll } = usePollMutations();
  const { data: session } = authClient.useSession();
  const participants = useWebsocketStore((state) => state.participants);

  // Fetch selected poll data
  const {
    data: selectedPoll,
    isPending: pollLoading,
    error: pollError,
  } = usePollById(search.rid, selectedPollId || "");

  const handleCreatePoll = async (questionId: string) => {
    await createPoll.mutateAsync({ roomId: data?.room?.id, questionId });
  };

  const handleSubmitPollAnswer = async () => {
    if (!selectedPollId || !data?.room?.id) return;

    await submitPollAnswer.mutateAsync({
      roomId: data.room.id,
      pollId: selectedPollId,
    });
  };

  const handleDeletePoll = async () => {
    if (!selectedPollId || !data?.room?.id) return;

    if (
      window.confirm(
        "Are you sure you want to delete this poll? This action cannot be undone."
      )
    ) {
      await deletePoll.mutateAsync({
        roomId: data.room.id,
        pollId: selectedPollId,
      });
      setSelectedPollId(null);
    }
  };

  const startWebsocketConnection = async () => {
    if (useWebsocketStore.getState().websocket) {
      console.log("websocket already subscribed");
      return;
    }
    console.log("Connecting websocket");

    try {
      const ws = api.ws.rooms({ id })({ pid: search.pid }).subscribe();
      useWebsocketStore.getState().setWebsocket(ws);
      ws.on("open", (event) => {
        console.log("WebSocket connected", event);
      });

      ws.on("message", (event) => {
        if (event.data[422]) {
          console.error("Data validation failed", event.data);
          return;
        }
        const data = event.data as unknown as (typeof event.data)[200];
        const channelSignal = event.data as unknown as string;

        if (data?.event === "participants:result") {
          useWebsocketStore.getState().setParticipants(data?.participants);
          useWebsocketStore.getState().setLoadingParticipants(false);
        } else if (
          data?.event === "participant:updated" ||
          channelSignal === "participants:notfresh"
        ) {
          useWebsocketStore.getState().fetchParticipants(search.rid);
        } else if (data?.event === "error") {
          useWebsocketStore.getState().setParticipantsError(data?.message);
          useWebsocketStore.getState().setLoadingParticipants(false);
          toast.error(`Participants error: ${data.message}`);
        }
      });

      ws.on("error", (error) => {
        console.error("WebSocket error:", error);
        useWebsocketStore
          .getState()
          .setParticipantsError("WebSocket connection error");
        toast.error("Connection error occurred");
      });

      ws.on("close", (event) => {
        console.log("WebSocket closed", event);
        useWebsocketStore.getState().setWebsocket(null);
        useWebsocketStore.getState().setParticipants([]);
        useWebsocketStore.getState().setParticipantsError(null);
      });
    } catch (error) {
      console.error("Failed to connect to the room", error);
      toast.error("Failed to connect to the room, Please try again later");
    }
  };

  useEffect(() => {
    startWebsocketConnection();
  }, []);

  if (isPending) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (error || !data?.room) {
    return (
      <div className="min-h-screen bg-base-100 flex flex-col items-center justify-center">
        <Icon icon="lineicons:ban" className="text-8xl mb-6 text-error" />
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-base-content mb-4">
            {typeof error === "string"
              ? error
              : error?.message || "Room not found"}
          </h2>
          <p className="text-base-content/70 mb-6">
            The room you're looking for doesn't exist or you don't have access
            to it.
          </p>
        </div>
      </div>
    );
  }

  // Show polls if they exist, otherwise show empty state
  const hasPolls = pollsData && pollsData.length > 0;

  // Show loading state while polls are being fetched
  if (pollsPending) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg mb-4"></div>
          <p className="text-base-content/70">Loading polls...</p>
        </div>
      </div>
    );
  }

  // Show error state for polls
  if (pollsError) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-base-100 flex flex-col items-center justify-center">
        <Icon icon="lineicons:warning" className="text-6xl mb-6 text-warning" />
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-base-content mb-4">
            Error Loading Polls
          </h2>
          <p className="text-base-content/70 mb-6">
            {typeof pollsError === "string"
              ? pollsError
              : pollsError?.message || "Failed to load polls"}
          </p>
          <button
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-base-100 flex">
      {/* Polls Sidebar */}
      <div className="w-80 bg-base-100 border-r border-base-300 flex flex-col">
        <div className="p-4 border-b border-base-300">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-base-content">
              Active Polls
            </h3>
            <div className="flex gap-2">
              <button
                className="btn btn-ghost btn-sm btn-circle"
                onClick={() => setShowShareModal(true)}
                title="Share Room"
              >
                <Icon icon="lineicons:share" className="size-4" />
              </button>
            </div>
          </div>
          <button
            className="btn btn-primary btn-sm mt-2 w-full"
            onClick={() => setShowCreatePollModal(true)}
          >
            <Icon icon="lineicons:plus" className="size-4 mr-2" />
            Create Poll
          </button>
        </div>
        <div className="flex-1 p-2 max-h-[calc(100vh-200px)] overflow-y-auto">
          {hasPolls ? (
            pollsData.map((poll) => (
              <button
                key={poll.id}
                onClick={() => setSelectedPollId(poll.id)}
                className={`w-full text-left p-3 rounded-lg mb-2 transition-colors text-base-content ${
                  selectedPollId === poll.id
                    ? "bg-primary/10 border border-primary/20"
                    : "hover:bg-base-200"
                }`}
              >
                <div className="font-medium text-sm line-clamp-2 mb-2">
                  {poll.question?.text || "Untitled Poll"}
                </div>
                {poll.question?.options && poll.question.options.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {poll.question.options.slice(0, 2).map((option) => (
                      <span
                        key={option.id}
                        className="badge badge-outline badge-xs"
                      >
                        {option.text}
                      </span>
                    ))}
                    {poll.question.options.length > 2 && (
                      <span className="badge badge-outline badge-xs">
                        +{poll.question.options.length - 2}
                      </span>
                    )}
                  </div>
                )}
                <div className="text-xs text-base-content/60">
                  {new Date(poll.createdAt).toLocaleDateString()}
                </div>
              </button>
            ))
          ) : (
            <div className="flex items-center justify-center h-full text-center p-4">
              <div>
                <Icon
                  icon="lineicons:document"
                  className="text-4xl mb-4 text-base-content/40 mx-auto"
                />
                <p className="text-sm text-base-content/60">No polls yet</p>
                <p className="text-xs text-base-content/40 mt-1">
                  Create your first poll to get started
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-4">
          {selectedPollId ? (
            // Show selected poll
            pollLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="loading loading-spinner loading-lg mb-4"></div>
                  <p className="text-base-content/70">Loading poll...</p>
                </div>
              </div>
            ) : pollError ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Icon
                    icon="lineicons:warning"
                    className="text-6xl mb-6 text-warning mx-auto"
                  />
                  <h2 className="text-2xl font-semibold text-base-content mb-4">
                    Error Loading Poll
                  </h2>
                  <p className="text-base-content/70 mb-6">
                    {typeof pollError === "string"
                      ? pollError
                      : pollError?.message || "Failed to load poll"}
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={() => setSelectedPollId(null)}
                  >
                    Back to Polls
                  </button>
                </div>
              </div>
            ) : selectedPoll ? (
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setSelectedPollId(null)}
                    >
                      <Icon
                        icon="lineicons:arrow-left"
                        className="size-4 mr-2"
                      />
                      Back to Polls
                    </button>
                    <div className="divider divider-horizontal"></div>
                    <h1 className="text-2xl font-bold text-base-content">
                      {selectedPoll.question?.text || "Untitled Poll"}
                    </h1>
                  </div>
                  <div className="flex gap-2">
                    {session &&
                      participants?.find((p) => p.userId === session.user.id)
                        ?.role === "host" && (
                        <button
                          className="btn btn-ghost btn-sm text-error hover:bg-error hover:text-error-content"
                          onClick={handleDeletePoll}
                          disabled={deletePoll.isPending}
                          title="Delete Poll"
                        >
                          {deletePoll.isPending ? (
                            <div className="loading loading-spinner loading-sm"></div>
                          ) : (
                            <Icon icon="lineicons:trash-3" className="size-4" />
                          )}
                        </button>
                      )}
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setShowShareModal(true)}
                    >
                      <Icon icon="lineicons:share" className="size-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Poll Details */}
                  <div className="card bg-base-100 shadow-sm">
                    <div className="card-body">
                      <h3 className="card-title text-lg mb-4">Poll Details</h3>
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-base-content/70">
                            Question:
                          </span>
                          <p className="text-base-content mt-1">
                            {selectedPoll.question?.text}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-base-content/70">
                            Created:
                          </span>
                          <p className="text-base-content mt-1">
                            {new Date(selectedPoll.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-base-content/70">
                            Status:
                          </span>
                          <div className="badge badge-outline mt-1">Active</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="card bg-base-100 shadow-sm">
                    <div className="card-body">
                      <h3 className="card-title text-lg mb-4">Options</h3>
                      {selectedPoll.question?.options &&
                      selectedPoll.question.options.length > 0 ? (
                        <div className="space-y-2">
                          {selectedPoll.question.options.map((option) => (
                            <div
                              key={option.id}
                              className="p-3 bg-base-200 rounded-lg"
                            >
                              <span className="font-medium">{option.text}</span>
                              {option.isCorrect && (
                                <div className="badge badge-success badge-xs ml-2">
                                  Correct
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-base-content/60">
                          No options available
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Poll Answer Section */}
                <div className="card bg-base-100 shadow-sm mt-6">
                  <div className="card-body">
                    <h3 className="card-title text-lg mb-4">Your Response</h3>
                    {session && data?.room?.participants ? (
                      <div className="space-y-4">
                        {data.room.participants.find(
                          (p) => p.userId === session.user.id
                        )?.role === "host" ? (
                          <div className="alert alert-info">
                            <Icon icon="lineicons:info" className="size-4" />
                            <span>
                              You are the host of this room. Poll hosts cannot
                              submit answers.
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <p className="text-base-content/70">
                              Submit your answer to participate in this poll.
                            </p>
                            <button
                              className="btn btn-primary w-full"
                              onClick={handleSubmitPollAnswer}
                              disabled={submitPollAnswer.isPending}
                            >
                              {submitPollAnswer.isPending ? (
                                <>
                                  <div className="loading loading-spinner loading-sm mr-2"></div>
                                  Submitting...
                                </>
                              ) : (
                                <>
                                  <Icon
                                    icon="lineicons:check"
                                    className="size-4 mr-2"
                                  />
                                  Submit Answer
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="alert alert-warning">
                        <Icon icon="lineicons:warning" className="size-4" />
                        <span>
                          Please wait while we load your session information...
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Poll Statistics */}
                <div className="card bg-base-100 shadow-sm mt-6">
                  <div className="card-body">
                    <h3 className="card-title text-lg mb-4">Statistics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="stat">
                        <div className="stat-title">Total Options</div>
                        <div className="stat-value text-secondary">
                          {selectedPoll.question?.options?.length || 0}
                        </div>
                      </div>
                      <div className="stat">
                        <div className="stat-title">Correct Answers</div>
                        <div className="stat-value text-success">
                          {selectedPoll.question?.options?.filter(
                            (option) => option.isCorrect
                          ).length || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Icon
                    icon="lineicons:document"
                    className="text-6xl mb-6 text-base-content/40 mx-auto"
                  />
                  <h2 className="text-2xl font-semibold text-base-content mb-4">
                    Poll Not Found
                  </h2>
                  <p className="text-base-content/70 mb-6">
                    The selected poll could not be found or has been deleted.
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={() => setSelectedPollId(null)}
                  >
                    Back to Polls
                  </button>
                </div>
              </div>
            )
          ) : (
            // Show default state when no poll is selected
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md mx-auto">
                <div className="mb-8">
                  <Icon
                    icon="lineicons:document"
                    className="text-6xl mb-6 text-primary mx-auto"
                  />
                  <h1 className="text-3xl font-bold text-base-content mb-2">
                    Select a Poll
                  </h1>
                  <p className="text-lg text-base-content/70 mb-4">
                    Choose a poll from the sidebar to view details and manage it
                  </p>
                  <p className="text-base-content/70 mb-6">
                    Or create a new poll to get started
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-4">
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={() => setShowCreatePollModal(true)}
                  >
                    <Icon icon="lineicons:plus" className="w-5 h-5 mr-2" />
                    Create Poll
                  </button>

                  <button
                    className="btn btn-outline btn-lg"
                    onClick={() => setShowShareModal(true)}
                  >
                    <Icon icon="lineicons:share" className="w-5 h-5 mr-2" />
                    Share Room
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-base-200 border-t border-base-300 p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-center">
            <label
              htmlFor="participants-drawer"
              className="btn btn-neutral btn-circle btn-sm"
            >
              <Icon icon="lineicons:users" className="size-6" />
            </label>
          </div>
        </div>
      </div>

      {/* Participants Drawer */}
      <input
        id="participants-drawer"
        type="checkbox"
        className="drawer-toggle"
        checked={showParticipantsPanel}
        onChange={() => setShowParticipantsPanel(!showParticipantsPanel)}
      />
      <RoomParticipantsDrawer
        setShowParticipantsPanel={setShowParticipantsPanel}
        roomId={search.rid}
      />

      {showShareModal && data.room && (
        <ShareRoomModal
          room={data.room}
          onClose={() => setShowShareModal(false)}
        />
      )}

      <CreatePollModal
        isOpen={showCreatePollModal}
        onClose={() => setShowCreatePollModal(false)}
        onCreatePoll={handleCreatePoll}
      />
    </div>
  );
}
