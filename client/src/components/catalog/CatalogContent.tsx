import { Icon } from "@iconify/react";
import { useCatalogStore } from "@/store/catalog";
import { QuestionForm } from "./QuestionForm";

interface CatalogContentProps {}

export function CatalogContent({}: CatalogContentProps) {
  const selectedCatalog = useCatalogStore((state) => state.selectedCatalog);
  const selectedQuestion = useCatalogStore((state) => state.selectedQuestion);
  const showCreateQuestionForm = useCatalogStore(
    (state) => state.showCreateQuestionForm
  );

  if (!selectedCatalog) {
    return (
      <div className="flex-1 p-6 bg-base-200">
        <div className="text-center py-12">
          <Icon
            icon="lineicons:bar-chart"
            className="text-6xl mb-4 text-base-content/50"
          />
          <h1 className="text-3xl font-bold text-base-content mb-4">
            Poll Management Dashboard
          </h1>
          <p className="text-base-content/70 text-lg max-w-md mx-auto">
            Select a catalog from the sidebar to view and manage your questions.
          </p>
        </div>
      </div>
    );
  }

  if (showCreateQuestionForm) {
    return <QuestionForm />;
  }

  if (!selectedQuestion) {
    return (
      <div className="flex-1 p-6 bg-base-200">
        <div className="text-center py-12">
          <Icon
            icon="lineicons:notebook-1"
            className="text-5xl mb-4 text-base-content/50"
          />
          <h2 className="text-2xl font-bold text-base-content mb-4">
            {selectedCatalog} Name
          </h2>
          <p className="text-base-content/70">
            Select a question from the sidebar to view its details and manage
            options.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-base-200 p-6">
      <h3 className="text-2xl font-bold text-base-content mb-4">
        {selectedQuestion} Title
      </h3>
      <div className="prose prose-lg max-w-none mb-6">
        <p className="text-base-content/80 leading-relaxed">
          {selectedQuestion} Content
        </p>
      </div>

      {/* Options Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-semibold text-base-content">
            Answer Options
          </h4>
          {/* <button className="btn btn-accent btn-sm" onClick={onAddOption}>
                + Add Option
              </button> */}
        </div>
        <div className="space-y-2">
          {/* {options.map((option) => (
                <div
                  key={option.id}
                  className={`p-3 rounded-lg border ${
                    option.isCorrect
                      ? "border-success bg-success/10"
                      : "border-base-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base-content">{option.text}</span>
                    <div className="flex gap-2">
                      {option.isCorrect && (
                        <span className="badge badge-success">Correct</span>
                      )}
                      <button
                        className="btn btn-ghost btn-xs"
                        onClick={() => onEditOption(option.id)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-ghost btn-xs text-error"
                        onClick={() => onDeleteOption(option.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))} */}
        </div>
      </div>

      {/* <div className="flex gap-3">
            <button className="btn btn-primary" onClick={onEditQuestion}>
              Edit Question
            </button>
            <button className="btn btn-outline" onClick={onCreatePoll}>
              Create Poll
            </button>
            <button className="btn btn-ghost" onClick={onDeleteQuestion}>
              Delete
            </button>
          </div> */}
    </div>
  );
}
