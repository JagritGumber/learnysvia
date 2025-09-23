import { create } from "zustand";
import { SelectPollWithQuestionAndOptions } from "@/shared/types/poll";

interface PollStore {
  roomId: string | null;
  setRoomId: (roomId: string | null) => void;
  poll: SelectPollWithQuestionAndOptions | null;
  setPoll: (poll: SelectPollWithQuestionAndOptions | null) => void;
}

export const usePollStore = create<PollStore>((set) => ({
  roomId: null,
  poll: null,
  setRoomId: (roomId) => set({ roomId }),
  setPoll: (poll) => set({ poll }),
}));
