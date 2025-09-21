import { create } from "zustand";

interface CatalogState {
  selectedCatalog: string | null;
  selectedQuestion: string | null;
  showCreateModal: boolean;
  showDeleteModal: boolean;
  showDeleteQuestionModal: boolean;
  showCreateQuestionForm: boolean;
  showEditQuestionForm: boolean;

  // Actions
  setSelectedCatalog: (catalogId: string | null) => void;
  setSelectedQuestion: (questionId: string | null) => void;
  setShowCreateModal: (show: boolean) => void;
  setShowDeleteModal: (show: boolean) => void;
  setShowDeleteQuestionModal: (show: boolean) => void;
  setShowCreateQuestionForm: (show: boolean) => void;
  setShowEditQuestionForm: (show: boolean) => void;
  clearSelection: () => void;
}

export const useCatalogStore = create<CatalogState>((set) => ({
  // Initial state
  selectedCatalog: null,
  selectedQuestion: null,
  showCreateModal: false,
  showDeleteModal: false,
  showDeleteQuestionModal: false,
  showCreateQuestionForm: false,
  showEditQuestionForm: false,

  // Actions
  setSelectedCatalog: (selectedCatalog) => set({ selectedCatalog }),
  setSelectedQuestion: (selectedQuestion) => set({ selectedQuestion }),
  setShowCreateModal: (showCreateModal) => set({ showCreateModal }),
  setShowDeleteModal: (showDeleteModal) => set({ showDeleteModal }),
  setShowDeleteQuestionModal: (showDeleteQuestionModal) => set({ showDeleteQuestionModal }),
  setShowCreateQuestionForm: (showCreateQuestionForm) =>
    set({ showCreateQuestionForm }),
  setShowEditQuestionForm: (showEditQuestionForm) =>
    set({ showEditQuestionForm }),
  clearSelection: () =>
    set({
      selectedCatalog: null,
      selectedQuestion: null,
      showCreateQuestionForm: false,
      showEditQuestionForm: false,
    }),
}));
