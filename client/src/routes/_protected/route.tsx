import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ProtectedRoute } from "../../components/ProtectedRoute";

export const Route = createFileRoute("/_protected")({
  component: ProtectedLayout,
});

function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <Outlet />
    </ProtectedRoute>
  );
}
