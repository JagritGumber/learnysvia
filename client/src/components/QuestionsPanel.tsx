import { Icon } from "@iconify/react";
import { useCatalogStore } from "@/store/catalog";
import { Question } from "@/utils/polls-api";

interface QuestionsPanelProps {
  questions: Question[];
  selectedCatalogData: {
    id: string;
    name: string;
  } | null;
  onDeleteCatalog: () => void;
  onCreateQuestion: () => void;
}

export function QuestionsPanel({
  questions,
  selectedCatalogData,
  onDeleteCatalog,
  onCreateQuestion
}: QuestionsPanelProps) {
  const { selectedQuestion, setSelectedQuestion } = useCatalogStore();

  const handleQuestionClick = (questionId: number) => {
    setSelectedQuestion(questionId);
  };

  if (!selectedCatalogData) {
    return null;
  }

  return (
    <div className="w-80 bg-base-100 border-r border-base-300">
      <div className="p-4 border-b border-base-300">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-base-content">
            {selectedCatalogData.name} Questions
          </h3>
          <button
            className="btn btn-ghost btn-sm btn-circle text-error"
            onClick={onDeleteCatalog}
          >
            <Icon icon="lineicons:trash-3" className="size-5" />
          </button>
        </div>
        <button
          className="btn btn-accent btn-sm mt-2 w-full"
          onClick={onCreateQuestion}
        >
          + New Question
        </button>
      </div>
      <div className="p-2 max-h-[calc(100vh-200px)] overflow-y-auto">
        {questions.map((question) => (
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
        ))}
      </div>
    </div>
  );
}
