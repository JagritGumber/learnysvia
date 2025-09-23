import { create } from "zustand";
import { SelectPollWithQuestionAndOptions } from "@/shared/types/poll";

interface PollStore {
  poll: SelectPollWithQuestionAndOptions | null;
  setPoll: (poll: SelectPollWithQuestionAndOptions | null) => void;
}

export const usePollStore = create<PollStore>((set) => ({
  poll: null,
  setPoll: (poll) => set({ poll }),
}));
