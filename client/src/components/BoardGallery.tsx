import { Icon } from "@iconify/react";

interface Board {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  backgroundColor: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface BoardGalleryProps {
  boards: Board[];
  onBoardClick: (board: Board) => void;
  onCreateBoard: () => void;
  onDeleteBoard: (boardId: string) => void;
}

// Board Card Component
function BoardCard({
  board,
  onBoardClick,
  onDeleteBoard,
}: {
  board: Board;
  onBoardClick: (board: Board) => void;
  onDeleteBoard: (boardId: string) => void;
}) {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete "${board.name}"?`)) {
      onDeleteBoard(board.id);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div
      className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
      onClick={() => onBoardClick(board)}
    >
      <div className="card-body p-4">
        {/* Board Preview */}
        <div
          className="w-full h-32 rounded-lg mb-3 border border-base-300"
          style={{ backgroundColor: board.backgroundColor }}
        >
          <div className="w-full h-full flex items-center justify-center">
            <Icon icon="heroicons:document-text" className="size-8 text-base-content/30" />
          </div>
        </div>

        {/* Board Info */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base-content truncate">
              {board.name}
            </h3>
            {board.description && (
              <p className="text-sm text-base-content/70 mt-1 line-clamp-2">
                {board.description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2 text-xs text-base-content/60">
              <span>Updated {formatDate(board.updatedAt)}</span>
              {board.isPublic && (
                <span className="badge badge-primary badge-xs">Public</span>
              )}
            </div>
          </div>

          {/* Delete Button */}
          <button
            className="btn btn-ghost btn-sm btn-circle opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleDelete}
            title="Delete board"
          >
            <Icon icon="heroicons:trash" className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function BoardGallery({
  boards,
  onBoardClick,
  onCreateBoard,
  onDeleteBoard,
}: BoardGalleryProps) {
  const sortedBoards = [...boards].sort((a, b) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-base-content">
            Your Boards ({sortedBoards.length})
          </h2>
          <p className="text-base-content/70 mt-1">
            Create and manage your interactive whiteboards
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={onCreateBoard}
        >
          <Icon icon="heroicons:plus" className="size-4" />
          Create Board
        </button>
      </div>

      {/* Boards Grid */}
      {sortedBoards.length === 0 ? (
        <div className="text-center py-16">
          <Icon
            icon="heroicons:document-text"
            className="size-16 mx-auto mb-4 text-base-content/30"
          />
          <h3 className="text-xl font-semibold text-base-content mb-2">
            No boards yet
          </h3>
          <p className="text-base-content/70 mb-6">
            Create your first whiteboard to get started with interactive teaching
          </p>
          <button
            className="btn btn-primary"
            onClick={onCreateBoard}
          >
            <Icon icon="heroicons:plus" className="size-4" />
            Create Your First Board
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedBoards.map((board) => (
            <BoardCard
              key={board.id}
              board={board}
              onBoardClick={onBoardClick}
              onDeleteBoard={onDeleteBoard}
            />
          ))}
        </div>
      )}
    </div>
  );
}
