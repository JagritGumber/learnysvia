import { Icon } from "@iconify/react";
import { useCatalogStore } from "@/store/catalog";
import { useCatalogQuestions } from "@/queries/questions";
import { AutoSizeLoader } from "../core/AutoSizeLoader";

interface CatalogQuestionsSidebarProps {}

export function CatalogQuestionsSidebar({}: CatalogQuestionsSidebarProps) {
  const { setSelectedQuestion, setShowDeleteModal } =
    useCatalogStore.getState();
  const selectedCatalog = useCatalogStore((state) => state.selectedCatalog);
  const selectedQuestion = useCatalogStore((state) => state.selectedQuestion);
  const {
    data: catalogWithQuestions,
    isPending,
    error,
  } = useCatalogQuestions(selectedCatalog);

  const handleDeleteCatalog = () => {
    setShowDeleteModal(true);
  };

  const handleQuestionClick = (questionId: string) => {
    setSelectedQuestion(questionId);
  };

  const handleCreateQuestion = () => {
    // TODO: Implement create question functionality
    console.log("Create question clicked");
  };

  if (isPending) {
    return <AutoSizeLoader className="w-80" />;
  }

  if (error) {
    return null;
  }

  if (!catalogWithQuestions) {
    return null;
  }

  return (
    <div className="w-80 bg-base-100 border-r border-base-300">
      <div className="p-4 border-b border-base-300">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-base-content">
            {catalogWithQuestions.name} Questions
          </h3>
          <button
            className="btn btn-ghost btn-sm btn-circle text-error"
            onClick={handleDeleteCatalog}
          >
            <Icon icon="lineicons:trash-3" className="size-5" />
          </button>
        </div>
        <button
          className="btn btn-primary btn-sm mt-2 w-full"
          onClick={handleCreateQuestion}
        >
          + New Question
        </button>
      </div>
      <div className="p-2 max-h-[calc(100vh-200px)] overflow-y-auto">
        {catalogWithQuestions?.questions?.map((question) => {
          if (!question) return null;
          return (
            <button
              key={question.id}
              onClick={() => handleQuestionClick(question.id)}
              className={`w-full text-left p-3 rounded-lg mb-2 transition-colors ${
                selectedQuestion === question.id
                  ? "bg-secondary text-secondary-content"
                  : "hover:bg-base-200 text-base-content"
              }`}
            >
              <div className="font-medium text-sm line-clamp-2">
                {question.title}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
