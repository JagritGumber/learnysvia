import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PollSubmissionState {
  submittingPolls: Set<string>; // Track which polls are being submitted
  skippedPolls: Set<string>; // Track which polls have been skipped
  answeredPolls: Set<string>; // Track which polls have been answered

  // Actions
  startPollSubmission: (pollId: string) => void;
  completePollSubmission: (pollId: string) => void;
  markPollAsSkipped: (pollId: string) => void;
  markPollAsAnswered: (pollId: string) => void;
  hasPollBeenSubmitted: (pollId: string) => boolean;
  isPollBeingSubmitted: (pollId: string) => boolean;
  resetPollState: (pollId: string) => void;
  resetAll: () => void;
}

export const usePollSubmissionStore = create<PollSubmissionState>()(
  persist(
    (set, get) => ({
      submittingPolls: new Set(),
      skippedPolls: new Set(),
      answeredPolls: new Set(),

      startPollSubmission: (pollId: string) => {
        set((state) => ({
          submittingPolls: new Set([...state.submittingPolls, pollId]),
        }));
      },

      completePollSubmission: (pollId: string) => {
        set((state) => {
          const newSubmitting = new Set(state.submittingPolls);
          newSubmitting.delete(pollId);
          return {
            submittingPolls: newSubmitting,
          };
        });
      },

      markPollAsSkipped: (pollId: string) => {
        set((state) => ({
          skippedPolls: new Set([...state.skippedPolls, pollId]),
        }));
      },

      markPollAsAnswered: (pollId: string) => {
        set((state) => ({
          answeredPolls: new Set([...state.answeredPolls, pollId]),
        }));
      },

      hasPollBeenSubmitted: (pollId: string) => {
        const state = get();
        return state.skippedPolls.has(pollId) || state.answeredPolls.has(pollId);
      },

      isPollBeingSubmitted: (pollId: string) => {
        const state = get();
        return state.submittingPolls.has(pollId);
      },

      resetPollState: (pollId: string) => {
        set((state) => {
          const newSubmitting = new Set(state.submittingPolls);
          const newSkipped = new Set(state.skippedPolls);
          const newAnswered = new Set(state.answeredPolls);

          newSubmitting.delete(pollId);
          newSkipped.delete(pollId);
          newAnswered.delete(pollId);

          return {
            submittingPolls: newSubmitting,
            skippedPolls: newSkipped,
            answeredPolls: newAnswered,
          };
        });
      },

      resetAll: () => {
        set({
          submittingPolls: new Set(),
          skippedPolls: new Set(),
          answeredPolls: new Set(),
        });
      },
    }),
    {
      name: "poll-submission-store",
      // Only persist the completed states, not the submitting state
      partialize: (state) => ({
        skippedPolls: state.skippedPolls,
        answeredPolls: state.answeredPolls,
      }),
    }
  )
);
