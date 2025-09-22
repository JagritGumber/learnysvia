export function RoomLoadingState() {
  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center">
      <div className="text-center">
        <div className="loading loading-spinner loading-lg mb-4"></div>
        <p className="text-base-content/70">Loading room...</p>
      </div>
    </div>
  );
}

export function PollsLoadingState() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-base-100 flex items-center justify-center">
      <div className="text-center">
        <div className="loading loading-spinner loading-lg mb-4"></div>
        <p className="text-base-content/70">Loading polls...</p>
      </div>
    </div>
  );
}

export function PollLoadingState() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="loading loading-spinner loading-lg mb-4"></div>
        <p className="text-base-content/70">Loading poll...</p>
      </div>
    </div>
  );
}
