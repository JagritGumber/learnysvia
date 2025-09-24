import { api } from "@/utils/treaty";
import { create } from "zustand";

export type Participant = {
  id: string;
  roomId: string;
  userId: string | null;
  anonymousId: string | null;
  wsId: string | null;
  displayName: string | null;
  participantType: "authenticated" | "anonymous";
  role: "host" | "co_host" | "participant" | null;
  createdAt: Date;
};

type ApplyArgs<F, Args extends any[]> = F extends (
  ...params: infer P
) => infer R
  ? Args extends P
    ? R
    : // If Args is narrower than P (common when P uses broader object types),
      // allow compatibility: require Args to be assignable to P
      Args[number] extends never
      ? never
      : Args extends P
        ? R
        : never
  : never;

type FnAfterRooms = ApplyArgs<typeof api.ws.rooms, [{ id: string }]>;
type Stream = ApplyArgs<FnAfterRooms, [{ pid: string }]>;

type SubscribeFn = Stream extends { subscribe: infer S } ? S : never;
type WSType = SubscribeFn extends (...args: any[]) => infer R ? R : never;

export type WebsocketType = WSType;

export interface UseWebsocketStore {
  websocket: WebsocketType | null;
  participants: Participant[];
  isLoadingParticipants: boolean;
  participantsError: string | null;
  setWebsocket: (websocket: WebsocketType | null) => void;
  setParticipants: (participants: Participant[]) => void;
  setLoadingParticipants: (loading: boolean) => void;
  setParticipantsError: (error: string | null) => void;
  fetchParticipants: (roomId: string) => void;
  invalidatePolls: (roomId: string) => void;
  kickParticipant: (participantId: string) => void;
}

export const useWebsocketStore = create<UseWebsocketStore>((set, get) => ({
  websocket: null,
  participants: [],
  isLoadingParticipants: false,
  participantsError: null,
  setWebsocket: (websocket) => set({ websocket }),
  setParticipants: (participants) =>
    set({ participants, participantsError: null }),
  setLoadingParticipants: (isLoadingParticipants) =>
    set({ isLoadingParticipants }),
  setParticipantsError: (participantsError) => set({ participantsError }),
  fetchParticipants: (roomId: string) => {
    const { websocket, setLoadingParticipants, setParticipantsError } = get();
    if (!websocket) {
      setParticipantsError("WebSocket not connected");
      return;
    }

    setLoadingParticipants(true);
    websocket.send({
      event: "participants:get",
      roomId,
    });
  },
  invalidatePolls(roomId) {
    const { websocket } = get();
    if (!websocket) {
      return;
    }

    websocket.send({
      event: "poll:get",
      roomId,
    });
  },
  kickParticipant(participantId) {
    const { websocket } = get();
    if (!websocket) {
      return;
    }

    websocket.send({
      event: "participant:kick",
      participantId,
    });
  },
}));
