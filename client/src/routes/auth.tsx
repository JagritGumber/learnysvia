import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { authClient } from "../utils/auth-client";

export const Route = createFileRoute("/auth")({
  component: Auth,
});

function Auth() {
  const navigate = Route.useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setLoading(true);
    setError("");

    try {
      // First try to sign in
      let result: ReturnType<typeof authClient.signIn.email> =
        await authClient.signIn.email({
          email,
          password,
        });

      if (!result?.data?.user) {
        result = await authClient.signUp.email({
          email,
          password,
          name: email.split("@")[0], // Use email prefix as name
        });
      }

      if (!result?.data?.user) {
        throw new Error("Authentication failed");
      }

      navigate({ to: "/dashboard", replace: true });
    } catch (err: any) {
      // Normalize common error shapes
      const message =
        err?.message ||
        err?.error ||
        (typeof err === "string" ? err : null) ||
        "Authentication failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm mx-auto">
        <div className="card bg-base-100 border border-base-300 shadow-lg">
          <div className="card-body p-6 sm:p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-base-content mb-2">
                Welcome
              </h1>
              <p className="text-sm text-base-content/70">
                Sign in or create your account
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  required
                  className="input input-bordered w-full focus:input-primary"
                  placeholder="you@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Password</span>
                </label>
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  className="input input-bordered w-full focus:input-primary"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="alert alert-error shadow-sm text-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="stroke-current shrink-0 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !email.trim() || !password.trim()}
                className="btn btn-primary btn-block btn-lg"
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm mr-2"></span>
                    Signing in...
                  </>
                ) : (
                  "Continue"
                )}
              </button>
            </form>

            <div className="text-center mt-6">
              <p className="text-xs text-base-content/60">
                Rewiredu — Discord/Slack for online classrooms
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
