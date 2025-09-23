import { createFileRoute } from "@tanstack/react-router";
import { useRoomById } from "@/queries/roomById.query";
import { useRoomPolls } from "@/queries/roomPolls.query";
// Import new components
import {
  RoomLoadingState,
  PollsLoadingState,
} from "@/components/room/RoomLoadingState";
import {
  RoomErrorState,
  PollsErrorState,
} from "@/components/room/RoomErrorState";

// Import custom hooks
import { useRoomWebSocket } from "@/hooks/useRoomWebSocket";
import { useWebsocketStore } from "@/store/websocket";
import { authClient } from "@/utils/auth-client";
import { RoomHostView } from "@/components/room/RoomHostView";
import z from "zod";

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
  const { isPending: pollsPending, error: pollsError } = useRoomPolls(
    search.rid
  );

  // Custom hooks
  useRoomWebSocket({ roomId: search.rid, participantId: search.pid });

  // Check if current user is the host
  const { data: session } = authClient.useSession();
  const participants = useWebsocketStore((state) => state.participants);
  const currentParticipant = participants.find(
    (p) => p.userId === session?.user?.id
  );
  const isHost =
    currentParticipant?.role === "host" ||
    currentParticipant?.role === "co_host";

  // Fetch selected poll data

  // Early returns for loading and error states
  if (isPending) {
    return <RoomLoadingState />;
  }

  if (error || !data?.room) {
    return <RoomErrorState error={error} />;
  }

  if (pollsPending) {
    return <PollsLoadingState />;
  }

  if (pollsError) {
    return <PollsErrorState error={pollsError} />;
  }

  // If not the host, show waiting message
  if (!isHost) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
          <h2 className="text-2xl font-semibold text-base-content mb-2">
            Waiting for a poll to come
          </h2>
          <p className="text-base-content/60">
            The host will start a poll soon
          </p>
        </div>
      </div>
    );
  }

  return <RoomHostView rid={search.rid} />;
}
