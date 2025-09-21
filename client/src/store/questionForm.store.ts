import { create } from "zustand";

interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface QuestionFormState {
  text: string;
  options: Option[];
  isSubmitting: boolean;
  setText: (text: string) => void;
  setOptions: (options: Option[]) => void;
  addOption: () => void;
  removeOption: (id: string) => void;
  updateOption: (id: string, field: keyof Option, value: string | boolean) => void;
  resetForm: () => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
}

export const useQuestionFormStore = create<QuestionFormState>((set, get) => ({
  text: "",
  options: [
    { id: "1", text: "", isCorrect: false },
    { id: "2", text: "", isCorrect: false },
  ],
  isSubmitting: false,

  setText: (text: string) => set({ text }),

  setOptions: (options: Option[]) => set({ options }),

  addOption: () => {
    const { options } = get();
    const newId = (
      Math.max(...options.map((opt) => parseInt(opt.id))) + 1
    ).toString();
    set({
      options: [...options, { id: newId, text: "", isCorrect: false }]
    });
  },

  removeOption: (id: string) => {
    const { options } = get();
    if (options.length > 2) {
      set({
        options: options.filter((opt) => opt.id !== id)
      });
    }
  },

  updateOption: (id: string, field: keyof Option, value: string | boolean) => {
    const { options } = get();
    if (field === "isCorrect" && value === true) {
      // If marking an option as correct, uncheck all others
      set({
        options: options.map((opt) => ({
          ...opt,
          isCorrect: opt.id === id,
        }))
      });
    } else {
      set({
        options: options.map((opt) =>
          opt.id === id ? { ...opt, [field]: value } : opt
        )
      });
    }
  },

  resetForm: () => set({
    text: "",
    options: [
      { id: "1", text: "", isCorrect: false },
      { id: "2", text: "", isCorrect: false },
    ],
    isSubmitting: false,
  }),

  setIsSubmitting: (isSubmitting: boolean) => set({ isSubmitting }),
}));
