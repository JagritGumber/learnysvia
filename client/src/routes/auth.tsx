import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { authClient } from "../utils/auth-client";
import { Icon } from "@iconify/react";

export const Route = createFileRoute("/auth")({
  component: Auth,
});

function Auth() {
  const navigate = Route.useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

      navigate({ to: "/rooms", replace: true });
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
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="w-full max-w-sm mx-auto">
        <div className="card bg-base-100 border border-base-300 shadow">
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
                <label className="label mb-1">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  required
                  className="input input-bordered w-full focus:input-primary validator"
                  placeholder="you@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
                <div className="validator-hint hidden">
                  Please enter a valid email address
                </div>
              </div>

              <div className="form-control">
                <label className="label block mb-1">
                  <span className="label-text">Password</span>
                </label>
                <div className="join w-full">
                  <div className="w-full">
                    <input
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      minLength={8}
                      className="input input-bordered join-item focus:input-primary validator w-full"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                    />
                    <div className="validator-hint hidden">
                      Password must be at least 8 characters long
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost join-item"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    <Icon
                      icon={showPassword ? "ph:eye-bold" : "ph:eye-closed-bold"}
                    />
                  </button>
                </div>
              </div>

              {error && (
                <div className="alert alert-error shadow-sm text-sm">
                  <Icon icon="ph:x-circle-bold" />
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
              <p className="text-xs text-base-content/60">Learnysvia</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
