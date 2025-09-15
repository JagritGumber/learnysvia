import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { authClient } from "../utils/auth-client";
import { useAuth } from "../hooks/useAuth";

export const Route = createFileRoute("/auth")({
  component: Signin,
});

function Signin() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = Route.useNavigate();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-[calc(100svh-64px)] flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  // Don't render auth form if user is authenticated
  if (isAuthenticated) {
    return null;
  }
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    let session
    try {
      if (isSignUp) {
        session = await authClient.signUp.email({
          email,
          password,
          name: name || email.split("@")[0],
        });
      } else {
        session = await authClient.signIn.email({
          email,
          password,
        });
      }

     
      navigate({ to: "/dashboard", replace: true });
    } catch (err: any) {
      // Normalize common error shapes
      const message =
        err?.message ||
        err?.error ||
        (typeof err === "string" ? err : null) ||
        "An unexpected error occurred";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100svh-64px)] bg-base-100">
      <div className="container mx-auto py-16 px-6">
        {/* Right - Auth Card */}
        <div className="w-full max-w-md mx-auto">
          <div className="card bg-base-100 border border-base-300">
            <div className="card-body p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    {isSignUp ? "Create Account" : "Welcome Back"}
                  </h2>
                  <p className="text-sm text-base-content/70">
                    {isSignUp
                      ? "Start teaching today"
                      : "Sign in to your account"}
                  </p>
                </div>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                {isSignUp && (
                  <div className="form-control flex flex-col gap-2">
                    <label className="label">
                      <span className="label-text">Full name</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered w-full"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                )}

                <div className="form-control flex flex-col gap-2">
                  <label className="label">
                    <span className="label-text">Email</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="input input-bordered w-full"
                    placeholder="you@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="form-control flex flex-col gap-2">
                  <label className="label">
                    <span className="label-text">Password</span>
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete={
                      isSignUp ? "new-password" : "current-password"
                    }
                    required
                    className="input input-bordered w-full"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                {error && (
                  <div className="alert alert-error shadow-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="stroke-current shrink-0 h-5 w-5"
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

                <div className="flex items-center justify-between">
                  <label className="cursor-pointer flex items-center gap-2">
                    <input type="checkbox" className="checkbox" />
                    <span className="text-sm">Remember me</span>
                  </label>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary btn-block btn-lg"
                  >
                    {loading ? (
                      <>
                        <span className="loading loading-spinner loading-sm mr-2"></span>
                        Processing...
                      </>
                    ) : isSignUp ? (
                      "Create account"
                    ) : (
                      "Sign in"
                    )}
                  </button>
                </div>

                <p className="text-center text-sm mt-3">
                  {isSignUp ? (
                    <>
                      Already have an account{" "}
                      <button
                        className="link"
                        onClick={() => setIsSignUp(false)}
                      >
                        Sign in
                      </button>
                      .
                    </>
                  ) : (
                    <>
                      Don't have an account?{" "}
                      <button
                        type="button"
                        className="link"
                        onClick={() => setIsSignUp(true)}
                      >
                        Sign up
                      </button>
                    </>
                  )}
                </p>
              </form>
            </div>
          </div>

          <p className="text-xs text-center text-base-content/60 mt-3">
            Learnysvia — live teaching, instant feedback.
          </p>
        </div>
      </div>
    </div>
  );
}
