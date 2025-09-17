import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-base-100 p-4 md:p-6 lg:p-8">
      <div className="w-full">
        <div className="text-center py-12 px-4">
          <div className="text-6xl mb-4">📊</div>
          <h1 className="text-3xl md:text-4xl font-bold text-base-content mb-4">
            Dashboard
          </h1>
          <p className="text-base-content/70 text-lg max-w-md mx-auto">
            Welcome to your dashboard. This is where you can manage your content and settings.
          </p>
        </div>
      </div>
    </div>
  );
}
