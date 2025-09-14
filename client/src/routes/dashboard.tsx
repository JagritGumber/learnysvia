import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-base-100">
      <div className="container mx-auto py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-6">Dashboard</h1>
          <p className="text-lg text-base-content/70 mb-8">
            Welcome to your teaching dashboard. Here you can manage your
            classes, create lessons, and track student progress.
          </p>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card bg-base-100 border border-base-300">
              <div className="card-body">
                <h2 className="card-title">Create Lesson</h2>
                <p>
                  Start a new interactive lesson with auto-assembling canvas
                </p>
                <div className="card-actions justify-end">
                  <button className="btn btn-primary">Create</button>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 border border-base-300">
              <div className="card-body">
                <h2 className="card-title">My Classes</h2>
                <p>View and manage your teaching classes</p>
                <div className="card-actions justify-end">
                  <button className="btn btn-secondary">View</button>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 border border-base-300">
              <div className="card-body">
                <h2 className="card-title">Student Progress</h2>
                <p>Track student engagement and performance</p>
                <div className="card-actions justify-end">
                  <button className="btn btn-accent">Track</button>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card bg-base-100 border border-base-300">
            <div className="card-body">
              <h2 className="card-title">Recent Activity</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-base-200 rounded-lg">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div>
                    <p className="font-medium">Welcome to Learnysvia!</p>
                    <p className="text-sm text-base-content/70">
                      Your account has been created successfully
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
