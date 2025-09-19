import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { createRouter } from "./router";
import "./styles.css";
import { Provider } from "./integrations/tanstack-query/root-provider";
import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient();

const router = createRouter();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider queryClient={queryClient}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>
);
