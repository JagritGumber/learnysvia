import { createFileRoute, Outlet } from "@tanstack/react-router";
import Header from "../../components/Header";

export const Route = createFileRoute("/_public")({
  component: PublicLayout,
});

function PublicLayout() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}
