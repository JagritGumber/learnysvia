export const FullScreenLoader = () => {
  return (
    <div className="min-h-[calc(100svh-64px)] bg-base-100 flex items-center justify-center">
      <div className="text-center">
        <div className="loading loading-spinner loading-lg"></div>
        <p className="mt-4 text-base-content/70">Loading catalog...</p>
      </div>
    </div>
  );
};
