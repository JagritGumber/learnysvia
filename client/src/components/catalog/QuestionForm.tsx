import { useState } from "react";
import { Icon } from "@iconify/react";
import { useCatalogStore } from "@/store/catalog";
import { useQuestionMutations } from "@/mutations/questions.mutations";

interface QuestionFormProps {}

export function QuestionForm({}: QuestionFormProps) {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedCatalog = useCatalogStore((state) => state.selectedCatalog);
  const { createQuestion } = useQuestionMutations();

  const { setShowCreateQuestionForm } = useCatalogStore.getState();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!text.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await createQuestion.mutateAsync?.({
        text: text.trim(),
        cid: selectedCatalog!,
      });

      // Reset form and close
      setText("");
      setShowCreateQuestionForm(false);
    } catch (error) {
      console.error("Error creating question:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setText("");
    setShowCreateQuestionForm(false);
  };

  return (
    <div className=" flex-1 bg-base-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-base-content">
          Create New Question
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
            disabled={!text.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Creating...
              </>
            ) : (
              "Create Question"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
