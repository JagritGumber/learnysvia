import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import api from "@/utils/api";
import { Whiteboard } from "@/components/Whiteboard";

interface Board {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  userId: string;
  data: string;
  createdAt: string;
  updatedAt: string;
}

export const Route = createFileRoute("/_protected/board/$boardId")({
  component: BoardPage,
  loader: async ({ params }) => {
    // Optionally preload board data here if needed
    return { boardId: params.boardId };
  },
});

function BoardPage() {
  const { boardId } = Route.useLoaderData();

  // Fetch the specific board data
  const {
    data: board,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["board", boardId],
    queryFn: async () => {
      const response = await api.get(`/api/boards/${boardId}`);
      return response.data.board as Board;
    },
  });

  if (isLoading) {
    return (
      <div className="h-screen bg-base-100 flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (error || !board) {
    return (
      <div className="h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-error mb-2">
            Board Not Found
          </h2>
          <p className="text-base-content/70 mb-4">
            The board you're looking for doesn't exist or you don't have access
            to it.
          </p>
          <a href="/dashboard" className="btn btn-primary">
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-base-100">
      <Whiteboard boardId={board.id} boardName={board.name} data={board.data} />
    </div>
  );
}
