import { authClient } from "../utils/auth-client";
import { Navigate } from "@tanstack/react-router";
import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (!session?.user) {
    // Redirect to landing page if not authenticated
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
