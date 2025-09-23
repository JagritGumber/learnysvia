import { createFileRoute, Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { authClient } from "@/utils/auth-client";
import { PollPreview } from "@/components/room/PollPreview";

export const Route = createFileRoute("/_public/")({
  component: App,
});

export default function App() {
  const { data: session } = authClient.useSession();

  return (
    <div className="min-h-[100vh] flex flex-col bg-base-100 text-base-content">
      {/* HERO */}
      <main className="flex-1">
        <section className="pt-16 pb-20 bg-base-100">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="lg:pr-8">
                <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-6">
                  Teacher's Assistant
                </h1>
                <p className="text-lg lg:text-xl text-base-content/80 mb-8 max-w-2xl">
                  Real-time polls for instant student comprehension insights —
                  create rooms, launch polls, and act on results immediately.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <Link
                    to={session?.user ? "/rooms" : "/auth"}
                    className="btn btn-primary btn-lg"
                  >
                    Start Teaching
                  </Link>
                  <a href="#how-it-works" className="btn btn-outline btn-lg">
                    How it works
                  </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-base-200 border border-base-300">
                    <div className="font-semibold text-base-content">
                      Zero friction
                    </div>
                    <div className="text-sm text-base-content/70 mt-2">
                      Students join without accounts.
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-base-200 border border-base-300">
                    <div className="font-semibold text-base-content">
                      Instant results
                    </div>
                    <div className="text-sm text-base-content/70 mt-2">
                      Real-time analytics during class.
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-base-200 border border-base-300">
                    <div className="font-semibold text-base-content">
                      Reusable catalogs
                    </div>
                    <div className="text-sm text-base-content/70 mt-2">
                      Organize questions for repeat use.
                    </div>
                  </div>
                </div>
              </div>

              {/* Poll preview / visual */}
              <div className="relative">
                <PollPreview
                  question="Which fraction is larger?"
                  options={["1/2", "2/3", "3/4"]}
                  totalResponses={24}
                  correctPercentage={67}
                  timeRemaining="2:45"
                />

                <div className="absolute -bottom-6 left-6 text-sm text-base-content/60 hidden sm:block">
                  Live preview
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section
          id="features"
          className="pt-16 pb-20 bg-base-300 w-full border-t border-b border-base-300"
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">What you can do</h2>
              <p className="text-base-content/70 mt-2 max-w-2xl mx-auto">
                Built for teachers who want quick feedback with minimum setup.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: "Room Management",
                  desc: "Create secure rooms, manage participants and control sessions.",
                  icon: "lineicons:signal",
                  color: "bg-primary",
                },
                {
                  title: "Real-time Polls",
                  desc: "Launch polls with configurable timers and see live results.",
                  icon: "lineicons:bar-chart",
                  color: "bg-secondary",
                },
                {
                  title: "Question Catalogs",
                  desc: "Organize questions for reuse across classes and sessions.",
                  icon: "lineicons:folder",
                  color: "bg-accent",
                },
              ].map((f) => (
                <div
                  key={f.title}
                  className="p-4 rounded-lg bg-base-200 border border-base-300"
                >
                  <div
                    className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${f.color} text-white mb-4`}
                  >
                    <Icon icon={f.icon} className="text-xl" />
                  </div>
                  <div className="font-semibold text-base-content mb-4">
                    {f.title}
                  </div>
                  <p className="text-base-content/70 text-sm">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="pt-16 pb-20 bg-base-100">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">How it works</h2>
              <p className="text-base-content/70 max-w-2xl mx-auto">
                Simple, intuitive flows that get you up and running in minutes.
              </p>
            </div>

            {/* Teacher Flow */}
            <div className="mb-16">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-semibold text-primary mb-2">
                  Teacher Flow
                </h3>
                <p className="text-base-content/70">
                  Set up and manage your classroom polls
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="card bg-base-200 border border-base-300">
                  <div className="card-body text-center">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon
                        icon="lineicons:user"
                        className="text-2xl text-white"
                      />
                    </div>
                    <h4 className="card-title text-lg justify-center">
                      1. Sign Up
                    </h4>
                    <p className="text-base-content/70">
                      Create your account and get started immediately.
                    </p>
                  </div>
                </div>

                <div className="card bg-base-200 border border-base-300">
                  <div className="card-body text-center">
                    <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon
                        icon="lineicons:home"
                        className="text-2xl text-white"
                      />
                    </div>
                    <h4 className="card-title text-lg justify-center">
                      2. Create Room
                    </h4>
                    <p className="text-base-content/70">
                      Generate a secure room and share the link with students.
                    </p>
                  </div>
                </div>

                <div className="card bg-base-200 border border-base-300">
                  <div className="card-body text-center">
                    <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon
                        icon="lineicons:bar-chart"
                        className="text-2xl text-white"
                      />
                    </div>
                    <h4 className="card-title text-lg justify-center">
                      3. Launch Polls
                    </h4>
                    <p className="text-base-content/70">
                      Use catalogs or create questions on-the-fly and launch
                      polls.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Student Flow */}
            <div>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-semibold text-secondary mb-2">
                  Student Flow
                </h3>
                <p className="text-base-content/70">
                  Zero-friction participation
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="card bg-base-200 border border-base-300">
                  <div className="card-body text-center">
                    <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon
                        icon="lineicons:link"
                        className="text-2xl text-white"
                      />
                    </div>
                    <h4 className="card-title text-lg justify-center">
                      Join Instantly
                    </h4>
                    <p className="text-base-content/70">
                      Click the room link — no account or app required.
                    </p>
                  </div>
                </div>

                <div className="card bg-base-200 border border-base-300">
                  <div className="card-body text-center">
                    <div className="w-16 h-16 bg-info rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon
                        icon="lineicons:check"
                        className="text-2xl text-white"
                      />
                    </div>
                    <h4 className="card-title text-lg justify-center">
                      Answer Polls
                    </h4>
                    <p className="text-base-content/70">
                      Quick multiple-choice questions that take seconds to
                      complete.
                    </p>
                  </div>
                </div>

                <div className="card bg-base-200 border border-base-300">
                  <div className="card-body text-center">
                    <div className="w-16 h-16 bg-warning rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon
                        icon="lineicons:thumbs-up"
                        className="text-2xl text-white"
                      />
                    </div>
                    <h4 className="card-title text-lg justify-center">
                      Done!
                    </h4>
                    <p className="text-base-content/70">
                      That's it! Students just answer and continue with class.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CALL TO ACTION */}
        <section className="pt-16 pb-20 bg-base-200 w-full border-t border-b border-base-300">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-3xl font-bold mb-4">
                Ready to improve class outcomes?
              </h3>
              <p className="text-base-content/70 mb-8 max-w-2xl mx-auto">
                Launch a room and run your first poll in under two minutes.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  to={session?.user ? "/rooms" : "/auth"}
                  className="btn btn-primary btn-lg"
                >
                  Start Teaching
                </Link>
                <a href="#features" className="btn btn-outline btn-lg">
                  Explore Features
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="pt-12 pb-8 bg-base-300 w-full border-t border-base-300">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-1">
              <h4 className="font-bold text-lg mb-4">Teacher's Assistant</h4>
              <p className="text-base-content/70 text-sm mb-4">
                Real-time polls for instant student comprehension insights.
              </p>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                  <Icon icon="lineicons:graduation" className="text-sm text-white" />
                </div>
                <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                  <Icon icon="lineicons:pie-chart" className="text-sm text-white" />
                </div>
                <div className="w-8 h-8 bg-accent rounded flex items-center justify-center">
                  <Icon icon="lineicons:book" className="text-sm text-white" />
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h5 className="font-semibold mb-4">Quick Links</h5>
              <ul className="space-y-2">
                <li>
                  <Link to={session?.user ? "/rooms" : "/auth"} className="link link-hover text-sm">
                    Start Teaching
                  </Link>
                </li>
                <li>
                  <a href="#features" className="link link-hover text-sm">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="link link-hover text-sm">
                    How it Works
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h5 className="font-semibold mb-4">Support</h5>
              <ul className="space-y-2">
                <li>
                  <a className="link link-hover text-sm">Help Center</a>
                </li>
                <li>
                  <a className="link link-hover text-sm">Contact Us</a>
                </li>
                <li>
                  <a className="link link-hover text-sm">Privacy Policy</a>
                </li>
                <li>
                  <a className="link link-hover text-sm">Terms of Service</a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-base-content/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-base-content/70">
              © {new Date().getFullYear()} Teacher's Assistant — Built for teachers, by teachers
            </div>
            <div className="flex items-center gap-4 text-sm text-base-content/70">
              <span>Made with ❤️ for educators</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
