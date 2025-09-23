export const RoomParticipantView = () => {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-base-100 flex items-center justify-center">
      <div className="text-center">
        <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
        <h2 className="text-2xl font-semibold text-base-content mb-2">
          Waiting for a poll to come
        </h2>
        <p className="text-base-content/60">The host will start a poll soon</p>
      </div>
    </div>
  );
};
