import { createRootRouteWithContext, Outlet, useLocation } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanstackDevtools } from "@tanstack/react-devtools";

import Header from "../components/Header";

import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";

import type { QueryClient } from "@tanstack/react-query";

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootComponent,
});

function RootComponent() {
  const location = useLocation();
  const isBoardRoute = location.pathname.startsWith('/board/');
  const isAuthRoute = location.pathname === '/auth';

  return (
    <div className="min-h-screen bg-base-100">
      {!isBoardRoute && !isAuthRoute && <Header />}
      <main className={isAuthRoute ? "" : "container mx-auto"}>
        <Outlet />
      </main>
      <TanstackDevtools
        config={{
          position: "bottom-left",
        }}
        plugins={[
          {
            name: "Tanstack Router",
            render: <TanStackRouterDevtoolsPanel />,
          },
          TanStackQueryDevtools,
        ]}
      />
    </div>
  );
}
