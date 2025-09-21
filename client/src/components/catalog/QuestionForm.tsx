import { Icon } from "@iconify/react";
import { useCatalogStore } from "@/store/catalog";
import { useQuestionMutations } from "@/mutations/questions.mutations";
import { useQuestionFormStore } from "@/store/questionForm.store";

interface QuestionFormProps {}

export function QuestionForm({}: QuestionFormProps) {
  const selectedCatalog = useCatalogStore((state) => state.selectedCatalog);
  const { createQuestion, updateQuestion } = useQuestionMutations();
  const { setShowCreateQuestionForm, setShowEditQuestionForm } = useCatalogStore.getState();

  // Use the store for all form state
  const {
    text,
    options,
    isSubmitting,
    isEditMode,
    editingQuestionId,
    setText,
    addOption,
    removeOption,
    updateOption,
    resetForm,
    setIsSubmitting,
  } = useQuestionFormStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!text.trim()) {
      return;
    }

    // Validate options
    const validOptions = options.filter((opt) => opt.text.trim());
    if (validOptions.length < 2) {
      return;
    }

    // Check if at least one option is marked as correct
    const hasCorrectAnswer = options.some((opt) => opt.isCorrect);
    if (!hasCorrectAnswer) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode && editingQuestionId) {
        // Update existing question
        await updateQuestion.mutateAsync?.({
          cid: selectedCatalog!,
          qid: editingQuestionId,
          text: text.trim(),
          options: validOptions.map((opt) => ({
            text: opt.text.trim(),
            isCorrect: opt.isCorrect,
          })),
        });

        // Reset form and close
        resetForm();
        setShowEditQuestionForm(false);
      } else {
        // Create new question
        await createQuestion.mutateAsync?.({
          text: text.trim(),
          cid: selectedCatalog!,
          options: validOptions.map((opt) => ({
            text: opt.text.trim(),
            isCorrect: opt.isCorrect,
          })),
        });

        // Reset form and close
        resetForm();
        setShowCreateQuestionForm(false);
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} question:`, error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    if (isEditMode) {
      setShowEditQuestionForm(false);
    } else {
      setShowCreateQuestionForm(false);
    }
  };

  return (
    <div className=" flex-1 bg-base-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-base-content">
          {isEditMode ? "Edit Question" : "Create New Question"}
        </h3>
        <button
          className="btn btn-ghost btn-sm btn-circle"
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          <Icon icon="lineicons:close" className="size-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-base-content mb-2">
            Question Text
          </label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="input input-bordered w-full"
            placeholder="Enter question text..."
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-base-content">
              Answer Options
            </label>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={addOption}
              disabled={isSubmitting || options.length >= 6}
            >
              <Icon icon="lineicons:plus" className="size-4" />
              Add Option
            </button>
          </div>

          <div className="space-y-3">
            {options.map((option, index) => (
              <div key={option.id} className="flex items-center gap-3">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-sm font-medium text-base-content min-w-fit">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) =>
                      updateOption(option.id, "text", e.target.value)
                    }
                    className="input input-bordered flex-1"
                    placeholder={`Option ${index + 1}...`}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="correct-answer"
                    checked={option.isCorrect}
                    onChange={() => updateOption(option.id, "isCorrect", true)}
                    disabled={isSubmitting}
                    className="radio radio-primary"
                  />
                  <span className="text-sm text-base-content">Correct</span>
                </label>

                <button
                  type="button"
                  className="btn btn-ghost btn-sm btn-circle text-error-content disabled:text-error"
                  onClick={() => removeOption(option.id)}
                  disabled={isSubmitting || options.length < 3}
                >
                  <Icon icon="lineicons:trash-3" className="size-4" />
                </button>
              </div>
            ))}
          </div>

          <p className="text-xs text-base-content/70 mt-2">
            Minimum 2 options required. Mark the correct answer(s) above.
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={
              !text.trim() ||
              isSubmitting ||
              options.filter((opt) => opt.text.trim()).length < 2 ||
              !options.some((opt) => opt.isCorrect)
            }
          >
            {isSubmitting ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                {isEditMode ? "Updating..." : "Creating..."}
              </>
            ) : (
              isEditMode ? "Update Question" : "Create Question"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
