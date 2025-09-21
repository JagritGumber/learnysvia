import { create } from 'zustand';
import { Question, Option } from '@/utils/polls-api';

interface CatalogState {
  // State
  questions: Question[];
  options: Option[];
  selectedCatalog: string | null;
  selectedQuestion: number | null;
  showCreateModal: boolean;

  // Actions
  setQuestions: (questions: Question[]) => void;
  setOptions: (options: Option[]) => void;
  setSelectedCatalog: (catalogId: string | null) => void;
  setSelectedQuestion: (questionId: number | null) => void;
  setShowCreateModal: (show: boolean) => void;
  clearSelection: () => void;
}

export const useCatalogStore = create<CatalogState>((set) => ({
  // Initial state
  questions: [],
  options: [],
  selectedCatalog: null,
  selectedQuestion: null,
  showCreateModal: false,

  // Actions
  setQuestions: (questions) => set({ questions }),
  setOptions: (options) => set({ options }),
  setSelectedCatalog: (selectedCatalog) => set({ selectedCatalog }),
  setSelectedQuestion: (selectedQuestion) => set({ selectedQuestion }),
  setShowCreateModal: (showCreateModal) => set({ showCreateModal }),
  clearSelection: () => set({
    selectedCatalog: null,
    selectedQuestion: null,
    questions: [],
    options: []
  }),
}));
