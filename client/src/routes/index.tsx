import { createFileRoute, Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  return (
    <div className="min-h-[calc(100vh-64px)]">
      {/* Hero Section */}
      <div className="hero min-h-[calc(100vh-64px)] bg-base-100">
        <div className="hero-content text-center">
          <div className="max-w-4xl">
            <h1 className="text-6xl font-bold text-base-content mb-6">
              Rewiredu
            </h1>
            <p className="text-3xl font-bold text-base-content mb-6">
              Discord/Slack for online classrooms — real-time collaborative and
              interactive learning.
            </p>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              A modern platform for educators and students,
              instant messaging, and seamless classroom management.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/auth" className="btn btn-primary btn-lg">
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
                      icon="lineicons:brush"
                      className="size-10 text-primary-content"
                    />
                  </div>
                  <h2 className="card-title">Auto-Assembling Canvas</h2>
                  <p>
                    Watch your teaching canvas build automatically as you speak
                    and draw in real-time
                  </p>
                </div>
              </div>

              <div className="card bg-base-100">
                <div className="card-body text-center">
                  <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon
                      icon="lineicons:users"
                      className="size-10 text-secondary-content"
                    />
                  </div>
                  <h2 className="card-title">Live Collaboration</h2>
                  <p>
                    Students see your whiteboard updates instantly and can
                    participate interactively
                  </p>
                </div>
              </div>

              <div className="card bg-base-100">
                <div className="card-body text-center">
                  <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon
                      icon="lineicons:pallet"
                      className="size-10 text-accent-content"
                    />
                  </div>
                  <h2 className="card-title">Vibrant Teaching Tools</h2>
                  <p>
                    Use advanced drawing tools, colors, and multimedia to create
                    memorable lessons
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
