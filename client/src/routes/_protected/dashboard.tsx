import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import api from "@/utils/api";
import { BoardGallery } from "@/components/BoardGallery";

export const Route = createFileRoute("/_protected/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const [boardName, setBoardName] = useState("");
  const [boardDescription, setBoardDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");

  // Fetch boards
  const {
    data: boardsData,
    isLoading: boardsLoading,
    refetch: refetchBoards,
  } = useQuery({
    queryKey: ["boards"],
    queryFn: async () => {
      const response = await api.get("/api/boards");
      return response.data.boards;
    },
  });

  const boards = boardsData || [];

  // Create board mutation
  const createBoardMutation = useMutation({
    mutationFn: async (boardData: {
      name: string;
      description: string;
      isPublic: boolean;
      backgroundColor: string;
    }) => {
      const response = await api.post("/api/boards/create", boardData);
      return response.data.board;
    },
    onSuccess: () => {
      refetchBoards();
      setBoardName("");
      setBoardDescription("");
      setIsPublic(false);
      setBackgroundColor("#ffffff");
      (
        document.getElementById("create-board-modal") as HTMLDialogElement
      )?.close();
    },
    onError: (error) => {
      console.error("Error creating board:", error);
    },
  });

  // Delete board mutation
  const deleteBoardMutation = useMutation({
    mutationFn: async (boardId: string) => {
      await api.delete(`/api/boards/${boardId}`);
    },
    onSuccess: () => {
      refetchBoards();
    },
    onError: (error) => {
      console.error("Error deleting board:", error);
    },
  });

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createBoardMutation.mutate({
      name: boardName,
      description: boardDescription,
      isPublic,
      backgroundColor,
    });
  };

  const handleCancel = () => {
    setBoardName("");
    setBoardDescription("");
    setIsPublic(false);
    setBackgroundColor("#ffffff");
    (
      document.getElementById("create-board-modal") as HTMLDialogElement
    )?.close();
  };

  const handleCreateBoard = () => {
    (
      document.getElementById("create-board-modal") as HTMLDialogElement
    )?.showModal();
  };

  const handleDeleteBoard = (boardId: string) => {
    deleteBoardMutation.mutate(boardId);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-base-100">
      <div className="pb-8 px-4 pt-0">
        {/* Create Board Modal */}
        <dialog id="create-board-modal" className="modal">
          <div className="modal-box max-w-md shadow-none">
            <h2 className="text-lg font-bold">Create New Board</h2>
            <form onSubmit={handleFormSubmit} className="space-y-4 mt-4">
              <div className="form-control flex flex-col gap-2">
                <label className="label">
                  <span className="label-text">Board Name</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter board name"
                  className="input input-bordered w-full"
                  value={boardName}
                  onChange={(e) => setBoardName(e.target.value)}
                  required
                />
              </div>
              <div className="form-control flex flex-col gap-2">
                <label className="label">
                  <span className="label-text">Description (optional)</span>
                </label>
                <textarea
                  placeholder="Describe what this board will be used for..."
                  className="textarea textarea-bordered w-full"
                  rows={3}
                  value={boardDescription}
                  onChange={(e) => setBoardDescription(e.target.value)}
                />
              </div>

              {/* Public Toggle */}
              <div className="form-control flex flex-col gap-1">
                <label className="label cursor-pointer flex justify-between">
                  <span className="label-text">Make board public</span>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                  />
                </label>
                <span className="label-text-alt text-sm text-base-content/60">
                  Public boards can be viewed by anyone with the link
                </span>
              </div>

              {/* Background Color */}
              <div className="form-control flex flex-col gap-2">
                <label className="label">
                  <span className="label-text">Background Color</span>
                </label>
                <div className="flex gap-2 justify-between">
                  {[
                    "#e11d48",
                    "#f472b6",
                    "#fb923c",
                    "#facc15",
                    "#84cc16",
                    "#10b981",
                    "#0ea5e9",
                    "#3b82f6",
                    "#8b5cf6",
                    "#a78bfa",
                  ].map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`flex-1 w-6 aspect-square rounded-lg border-none outline-none cursor-pointer ${
                        backgroundColor === color ? "ring-3 ring-secondary" : ""
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setBackgroundColor(color)}
                      title={color.toUpperCase()}
                    ></button>
                  ))}
                </div>
              </div>

              <div className="modal-action">
                <form method="dialog">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                </form>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={createBoardMutation.isPending}
                >
                  {createBoardMutation.isPending
                    ? "Creating..."
                    : "Create Board"}
                </button>
              </div>
            </form>
          </div>
        </dialog>

        {/* Main Content */}
        <div className="space-y-6">
          {boardsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="card bg-base-100 border border-base-300 shadow-sm"
                >
                  <div className="card-body p-4">
                    <div className="skeleton h-32 w-full mb-3"></div>
                    <div className="skeleton h-4 w-3/4 mb-2"></div>
                    <div className="skeleton h-3 w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <BoardGallery
              boards={boards}
              onCreateBoard={handleCreateBoard}
              onDeleteBoard={handleDeleteBoard}
            />
          )}
        </div>
      </div>
    </div>
  );
}
