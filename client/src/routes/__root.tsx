import {
  createRootRouteWithContext,
  Outlet,
  useLocation,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanstackDevtools } from "@tanstack/react-devtools";
import { useEffect } from "react";
import { useWebsocketStore } from "@/store/websocket";

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

  // Close WebSocket connection when leaving room route
  useEffect(() => {
    const isRoomRoute = location.pathname.includes("/room/");
    const { websocket } = useWebsocketStore.getState();

    if (!isRoomRoute && websocket) {
      console.log("Leaving room route, closing WebSocket connection");
      websocket.close();
      useWebsocketStore.getState().setWebsocket(null);
      useWebsocketStore.getState().setParticipants([]);
      useWebsocketStore.getState().setParticipantsError(null);
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-base-100">
      <main className="container mx-auto">
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
