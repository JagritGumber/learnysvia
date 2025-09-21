import { useState } from "react";
import { Icon } from "@iconify/react";
import { useCatalogStore } from "@/store/catalog";

interface QuestionFormProps {
  onCancel?: () => void;
  onSave?: (questionData: { title: string; content: string }) => void;
}

export function QuestionForm({ onCancel, onSave }: QuestionFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { setShowCreateQuestionForm } = useCatalogStore.getState();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Implement actual question creation API call
      await onSave?.({ title: title.trim(), content: content.trim() });

      // Reset form and close
      setTitle("");
      setContent("");
      setShowCreateQuestionForm(false);
    } catch (error) {
      console.error("Error creating question:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setTitle("");
    setContent("");
    setShowCreateQuestionForm(false);
    onCancel?.();
  };

  return (
    <div className="flex-1 p-6 bg-base-200">
      <div className="max-w-4xl mx-auto">
        <div className="bg-base-100 rounded-lg border border-base-300 p-6">
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
                Question Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input input-bordered w-full"
                placeholder="Enter question title..."
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-base-content mb-2">
                Question Content
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="textarea textarea-bordered w-full h-32"
                placeholder="Enter question content..."
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
                disabled={!title.trim() || !content.trim() || isSubmitting}
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
      </div>
    </div>
  );
}
