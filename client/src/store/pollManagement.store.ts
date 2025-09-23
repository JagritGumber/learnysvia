import { create } from "zustand";

interface PollManagementStore {
  selectedPollId: string | null;
  setSelectedPollId: (pollId: string | null) => void;
  clearSelectedPoll: () => void;
}

export const usePollManagementStore = create<PollManagementStore>((set) => ({
  selectedPollId: null,
  setSelectedPollId: (selectedPollId) => set({ selectedPollId }),
  clearSelectedPoll: () => set({ selectedPollId: null }),
}));
