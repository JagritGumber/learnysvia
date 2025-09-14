import { env } from "@/env";
import axios from "axios";

const api = axios.create({
  baseURL: env.VITE_SERVER_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
