import { useQuestionMutations } from "@/mutations/questions.mutations";
import { useCatalogStore } from "@/store/catalog";
import { Icon } from "@iconify/react";

export const DeleteQuestionAlertModal = () => {
  const { setShowDeleteQuestionModal } = useCatalogStore.getState();
  const selectedCatalog = useCatalogStore((state) => state.selectedCatalog);
  const selectedQuestion = useCatalogStore((state) => state.selectedQuestion);
  const { deleteQuestion } = useQuestionMutations();

  const handleConfirmDelete = async () => {
    if (selectedCatalog && selectedQuestion) {
      try {
        await deleteQuestion.mutateAsync({
          cid: selectedCatalog,
          qid: selectedQuestion,
        });
        setShowDeleteQuestionModal(false);
        // Clear the selected question after successful deletion
        const { setSelectedQuestion } = useCatalogStore.getState();
        setSelectedQuestion(null);
      } catch (error) {
        console.error("Failed to delete question:", error);
      }
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteQuestionModal(false);
  };

  return (
    <div className="modal-box">
      <h3 className="font-bold text-lg">Delete Question</h3>
      <p className="py-4">
        Are you sure you want to delete this question? This action cannot be
        undone and will also delete all options associated with this question.
      </p>
      <div className="modal-action">
        <button
          className="btn"
          onClick={handleCancelDelete}
          disabled={deleteQuestion.isPending}
        >
          Cancel
        </button>
        <button
          className="btn btn-error"
          onClick={handleConfirmDelete}
          disabled={deleteQuestion.isPending}
        >
          {deleteQuestion.isPending ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              Deleting...
            </>
          ) : (
            <>
              <Icon icon="lineicons:trash-3" className="size-4" />
              Delete
            </>
          )}
        </button>
      </div>
    </div>
  );
};
