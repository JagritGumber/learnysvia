import { treaty } from "@elysiajs/eden";
import type { App } from "../../../backend/src/index";

const api = treaty<App>("localhost:5173");

export { api };
