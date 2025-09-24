import { createFileRoute, Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { authClient } from "@/utils/auth-client";
import { PollPreview } from "@/components/room/PollPreview";
import toast from "react-hot-toast";

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
                  Learnysvia
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

        {/* WHY WE BUILT THIS */}
        <section className="pt-16 pb-20 bg-base-200 w-full border-t border-b border-base-300">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Why we built this tool
              </h2>
              <p className="text-base-content/70 max-w-2xl mx-auto">
                The problem every teacher faces, and how we solve it.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="p-6 rounded-lg bg-error/10 border border-error/20">
                  <h3 className="text-xl font-semibold text-error mb-3">
                    The Traditional Problem
                  </h3>
                  <p className="text-base-content/80 mb-4">
                    Teachers can explain and explain, but they only discover how
                    much the class understood on test day. By then, it's too
                    late to re-explain difficult concepts.
                  </p>
                  <p className="text-base-content/80">
                    Even with regular tests, teachers hardly know what specific
                    topics students are finding hard to understand. They get
                    scores, but not insights.
                  </p>
                </div>

                <div className="p-6 rounded-lg bg-success/10 border border-success/20">
                  <h3 className="text-xl font-semibold text-success mb-3">
                    Our Solution
                  </h3>
                  <p className="text-base-content/80 mb-4">
                    With simple-to-setup quick polls, teachers get real-time
                    feedback during class. No more waiting for test day to
                    discover comprehension gaps.
                  </p>
                  <p className="text-base-content/80">
                    Teachers can immediately understand which topics the class
                    didn't grasp and address them right away, while the material
                    is still fresh.
                  </p>
                </div>
              </div>

              <div className="lg:pl-8">
                <div className="p-6 rounded-lg bg-base-100 border border-base-300">
                  <h3 className="text-xl font-semibold mb-4">
                    Student Privacy First
                  </h3>
                  <p className="text-base-content/80 mb-4">
                    All polls are completely anonymous for students. No names,
                    no tracking, no judgment.
                  </p>
                  <p className="text-base-content/80 mb-4">
                    This creates a safe environment where students can answer
                    fearlessly without worrying about what others think or how
                    it might affect their grades.
                  </p>
                  <p className="text-base-content/80">
                    We just want them to answer honestly — no shyness, no
                    hesitation. The goal is understanding, not evaluation.
                  </p>
                </div>

                <div className="mt-6 p-4 rounded-lg bg-info/10 border border-info/20 h-full">
                  <div className="flex items-start gap-3">
                    <Icon
                      icon="lineicons:lightbulb"
                      className="text-2xl text-info mt-1"
                    />
                    <div>
                      <h4 className="font-semibold text-xl text-info mb-2">
                        Real Impact
                      </h4>
                      <p className="text-sm text-base-content/80">
                        Teachers can now adjust their teaching in real-time,
                        spend more time on challenging topics, and ensure no
                        student gets left behind.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section
          id="features"
          className="pt-16 pb-20 bg-base-100 w-full border-t border-b border-base-300"
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
                    className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${f.color} text-base-content mb-4`}
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
        <section id="how-it-works" className="pt-20 pb-24 bg-base-200 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <Icon icon="lineicons:rocket" className="text-primary text-lg" />
                <span className="text-primary font-medium text-sm">Simple Setup</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                How it works
              </h2>
              <p className="text-lg text-base-content/70 max-w-3xl mx-auto leading-relaxed">
                Two simple flows working together seamlessly — teachers create engaging polls while students participate effortlessly.
              </p>
            </div>

            {/* Teacher Flow */}
            <div className="mb-24">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                    <Icon icon="lineicons:user" className="text-xl text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-primary">Teacher Flow</h3>
                    <p className="text-base-content/60">Set up and manage your classroom polls</p>
                  </div>
                </div>
              </div>

              <div className="relative">
                {/* Connection arrows */}
                <div className="hidden lg:flex absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full justify-center items-center z-0">
                  <div className="flex items-center gap-8">
                    <Icon icon="lineicons:chevron-right" className="text-2xl text-primary/40" />
                    <Icon icon="lineicons:chevron-right" className="text-2xl text-secondary/40" />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 relative z-10">
                  <div className="group">
                    <div className="card bg-base-100 border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                      <div className="card-body text-center p-8">
                        <div className="relative mb-6">
                          <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <Icon icon="lineicons:user" className="text-3xl text-white" />
                          </div>
                          <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                            1
                          </div>
                        </div>
                        <h4 className="card-title text-xl justify-center mb-4 text-primary font-bold">
                          Sign Up
                        </h4>
                        <p className="text-base-content/70 leading-relaxed">
                          Create your free account in seconds and get instant access to all features.
                        </p>
                        <div className="mt-4 text-xs text-primary/60 font-medium">
                          Takes 30 seconds
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="group">
                    <div className="card bg-base-100 border-2 border-secondary/20 hover:border-secondary/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                      <div className="card-body text-center p-8">
                        <div className="relative mb-6">
                          <div className="w-20 h-20 bg-secondary rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <Icon icon="lineicons:home" className="text-3xl text-white" />
                          </div>
                          <div className="absolute -top-2 -right-2 w-8 h-8 bg-secondary text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                            2
                          </div>
                        </div>
                        <h4 className="card-title text-xl justify-center mb-4 text-secondary font-bold">
                          Create Room
                        </h4>
                        <p className="text-base-content/70 leading-relaxed">
                          Generate a secure room with a simple click and share the link with your students.
                        </p>
                        <div className="mt-4 text-xs text-secondary/60 font-medium">
                          One-click setup
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="group">
                    <div className="card bg-base-100 border-2 border-accent/20 hover:border-accent/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                      <div className="card-body text-center p-8">
                        <div className="relative mb-6">
                          <div className="w-20 h-20 bg-accent rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <Icon icon="lineicons:bar-chart" className="text-3xl text-white" />
                          </div>
                          <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                            3
                          </div>
                        </div>
                        <h4 className="card-title text-xl justify-center mb-4 text-accent font-bold">
                          Launch Polls
                        </h4>
                        <p className="text-base-content/70 leading-relaxed">
                          Use your question catalogs or create polls on-the-fly. See results in real-time.
                        </p>
                        <div className="mt-4 text-xs text-accent/60 font-medium">
                          Live results
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Student Flow */}
            <div>
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-success rounded-xl flex items-center justify-center shadow-lg">
                    <Icon icon="lineicons:users" className="text-xl text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-success">Student Flow</h3>
                    <p className="text-base-content/60">Zero-friction participation</p>
                  </div>
                </div>
              </div>

              <div className="relative">
                {/* Connection arrows */}
                <div className="hidden lg:flex absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full justify-center items-center z-0">
                  <div className="flex items-center gap-8">
                    <Icon icon="lineicons:chevron-right" className="text-2xl text-success/40" />
                    <Icon icon="lineicons:chevron-right" className="text-2xl text-info/40" />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 relative z-10">
                  <div className="group">
                    <div className="card bg-base-100 border-2 border-success/20 hover:border-success/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                      <div className="card-body text-center p-8">
                        <div className="relative mb-6">
                          <div className="w-20 h-20 bg-success rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <Icon icon="lineicons:link" className="text-3xl text-white" />
                          </div>
                          <div className="absolute -top-2 -right-2 w-8 h-8 bg-success text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                            1
                          </div>
                        </div>
                        <h4 className="card-title text-xl justify-center mb-4 text-success font-bold">
                          Join Instantly
                        </h4>
                        <p className="text-base-content/70 leading-relaxed">
                          Students click the room link — no account creation, no app downloads required.
                        </p>
                        <div className="mt-4 text-xs text-success/60 font-medium">
                          No signup needed
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="group">
                    <div className="card bg-base-100 border-2 border-info/20 hover:border-info/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                      <div className="card-body text-center p-8">
                        <div className="relative mb-6">
                          <div className="w-20 h-20 bg-info rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <Icon icon="lineicons:check" className="text-3xl text-white" />
                          </div>
                          <div className="absolute -top-2 -right-2 w-8 h-8 bg-info text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                            2
                          </div>
                        </div>
                        <h4 className="card-title text-xl justify-center mb-4 text-info font-bold">
                          Answer Polls
                        </h4>
                        <p className="text-base-content/70 leading-relaxed">
                          Quick multiple-choice questions appear automatically. Takes just seconds to complete.
                        </p>
                        <div className="mt-4 text-xs text-info/60 font-medium">
                          5 seconds average
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="group">
                    <div className="card bg-base-100 border-2 border-warning/20 hover:border-warning/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                      <div className="card-body text-center p-8">
                        <div className="relative mb-6">
                          <div className="w-20 h-20 bg-warning rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <Icon icon="lineicons:thumbs-up" className="text-3xl text-white" />
                          </div>
                          <div className="absolute -top-2 -right-2 w-8 h-8 bg-warning text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                            3
                          </div>
                        </div>
                        <h4 className="card-title text-xl justify-center mb-4 text-warning font-bold">
                          Done!
                        </h4>
                        <p className="text-base-content/70 leading-relaxed">
                          Students return to class seamlessly. Completely anonymous and stress-free.
                        </p>
                        <div className="mt-4 text-xs text-warning/60 font-medium">
                          Back to learning
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="text-center mt-16">
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-base-300/50 border border-base-300/50">
                <Icon icon="lineicons:clock" className="text-base-content/60" />
                <span className="text-base-content/70 font-medium">Entire setup takes less than 2 minutes</span>
              </div>
            </div>
          </div>
        </section>

        {/* CALL TO ACTION */}
        <section className="pt-16 pb-20 bg-base-100 w-full border-t border-b border-base-300">
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
              <h4 className="font-bold text-lg mb-4">Learnysvia</h4>
              <p className="text-base-content/70 text-sm mb-4">
                Real-time polls for instant student comprehension insights.
              </p>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                  <Icon
                    icon="lineicons:graduation"
                    className="text-sm text-base-content"
                  />
                </div>
                <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                  <Icon
                    icon="lineicons:pie-chart"
                    className="text-sm text-base-content"
                  />
                </div>
                <div className="w-8 h-8 bg-accent rounded flex items-center justify-center">
                  <Icon
                    icon="lineicons:book"
                    className="text-sm text-base-content"
                  />
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h5 className="font-semibold mb-4">Quick Links</h5>
              <ul className="space-y-2">
                <li>
                  <Link
                    to={session?.user ? "/rooms" : "/auth"}
                    className="link link-hover text-sm"
                  >
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
                  <a
                    className="link link-hover text-sm"
                    onClick={(e) => {
                      e.preventDefault();
                      toast("This feature is not there bro 🤗");
                    }}
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    className="link link-hover text-sm"
                    onClick={(e) => {
                      e.preventDefault();
                      toast("This feature is not there bro 🤗");
                    }}
                  >
                    Contact Us
                  </a>
                </li>
                <li>
                  <a
                    className="link link-hover text-sm"
                    onClick={(e) => {
                      e.preventDefault();
                      toast("This feature is not there bro 🤗");
                    }}
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    className="link link-hover text-sm"
                    onClick={(e) => {
                      e.preventDefault();
                      toast("This feature is not there bro 🤗");
                    }}
                  >
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-base-content/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-base-content/70">
              © {new Date().getFullYear()} Learnysvia — Built for teachers, by
              students.
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
