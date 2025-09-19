import { createFileRoute, Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { authClient } from "@/utils/auth-client";

export const Route = createFileRoute("/_public/")({
  component: App,
});

function App() {
  const { data: session } = authClient.useSession();

  return (
    <div className="min-h-[calc(100vh-64px)]">
      {/* Hero Section */}
      <div className="hero min-h-[calc(100vh-64px)] bg-base-100">
        <div className="hero-content text-center">
          <div className="max-w-4xl">
            <h1 className="text-6xl font-bold text-base-content mb-6">
              Teacher's Assistant
            </h1>
            <p className="text-3xl font-bold text-base-content mb-6">
              Real-time polls for instant student comprehension insights.
            </p>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Create rooms, launch polls, and get immediate feedback on student
              understanding. Build question catalogs and use NLP-powered search
              to find the perfect assessment questions.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                to={session?.user ? "/rooms" : "/auth"}
                className="btn btn-primary btn-lg"
              >
                Start Teaching
              </Link>
              <button className="btn btn-outline btn-lg">Learn More</button>
            </div>

            {/* Feature highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <div className="card bg-base-100">
                <div className="card-body text-center">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon
                      icon="lineicons:signal"
                      className="size-10 text-primary-content"
                    />
                  </div>
                  <h2 className="card-title justify-center">Room Management</h2>
                  <p>
                    Create secure rooms and share links with students. Manage
                    participants and control poll sessions effortlessly.
                  </p>
                </div>
              </div>

              <div className="card bg-base-100">
                <div className="card-body text-center">
                  <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon
                      icon="lineicons:bar-chart"
                      className="size-10 text-secondary-content"
                    />
                  </div>
                  <h2 className="card-title justify-center">Real-Time Polls</h2>
                  <p>
                    Launch polls with configurable time limits (default 2 mins).
                    Get instant feedback on student comprehension and
                    understanding.
                  </p>
                </div>
              </div>

              <div className="card bg-base-100">
                <div className="card-body text-center">
                  <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon
                      icon="lineicons:search"
                      className="size-10 text-accent-content"
                    />
                  </div>
                  <h2 className="card-title justify-center">
                    Question Catalogs
                  </h2>
                  <p>
                    Build comprehensive question libraries and use NLP-powered
                    search to find the perfect assessment questions instantly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
