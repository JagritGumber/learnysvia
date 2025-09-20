import type { EdenWS } from "@elysiajs/eden/treaty";
import { create } from "zustand";

export type WebsocketType = EdenWS<{
  body: {
    event: "join";
    code: string;
    name: string;
    anonymousId: string;
  };
  params: {
    id: string;
  };
  query: {};
  headers: {};
  response: {
    200: {
      event: "error" | "joined" | "room_started";
      message: string;
    };
    422: {
      type: "validation";
      on: string;
      summary?: string;
      message?: string;
      found?: unknown;
      property?: string;
      expected?: string;
    };
  };
}>;

export interface UseWebsocketStore {
  websocket: WebsocketType | null;
  setWebsocket: (websocket: WebsocketType | null) => void;
}

export const useWebsocketStore = create<UseWebsocketStore>((set) => ({
  websocket: null,
  setWebsocket: (websocket) => set({ websocket }),
}));
