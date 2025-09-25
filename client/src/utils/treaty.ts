import { treaty } from "@elysiajs/eden";
import type { App } from "../../../backend/src/index";

const api = treaty<App>(import.meta.env.VITE_SERVER_URL, {
  fetch: {
    credentials: "include",
  },
});

export { api };
