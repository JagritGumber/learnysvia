import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/rooms")({
  component: Rooms,
});

function Rooms() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-base-100 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🏠</div>
        <h1 className="text-3xl font-bold text-base-content mb-4">Rooms</h1>
        <p className="text-base-content/70 text-lg max-w-md mx-auto">
          Room management coming soon...
        </p>
      </div>
    </div>
  );
}
