import { createFileRoute } from "@tanstack/react-router";
import { useRoomMutations } from "../../mutations/rooms";
import { useEffect } from "react";
import z from "zod";

const searchSchema = z.object({
  rid: z.string(),
});

export const Route = createFileRoute("/_public/join/$code")({
  component: JoinRoomPage,
  validateSearch: (search) => searchSchema.parse(search),
});

function JoinRoomPage() {
  const { code } = Route.useParams();
  const { joinRoom } = useRoomMutations();
  const navigate = Route.useNavigate();
  const search = Route.useSearch();

  useEffect(() => {
    if (!joinRoom.isPending && !joinRoom.isSuccess) {
      joinRoom.mutateAsync({ code, name: "Some Name", type: "auth" });
    }
  }, [joinRoom.isPending]);

  if (joinRoom.isSuccess) {
    navigate({
      to: "/room/$id",
      params: {
        id: code,
      },
      search: {
        pid: joinRoom.data?.id,
        rid: search.rid,
      },
    });
  }

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
      <div className="loading loading-spinner loading-md"></div>
    </div>
  );
}
