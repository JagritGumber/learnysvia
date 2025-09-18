import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  pollsApi,
  type Catalog,
  type Question,
  type Option,
} from "../../utils/polls-api";
import { Icon } from "@iconify/react";

export const Route = createFileRoute("/_protected/catalog")({
  component: Catalog,
});

function Catalog() {
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [options, setOptions] = useState<Option[]>([]);
  const [selectedCatalog, setSelectedCatalog] = useState<number | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load catalogs on component mount
  useEffect(() => {
    loadCatalogs();
  }, []);

  // Load questions when catalog changes
  useEffect(() => {
    if (selectedCatalog) {
      loadQuestions(selectedCatalog);
    } else {
      setQuestions([]);
      setSelectedQuestion(null);
    }
  }, [selectedCatalog]);

  // Load options when question changes
  useEffect(() => {
    if (selectedQuestion) {
      loadOptions(selectedQuestion);
    } else {
      setOptions([]);
    }
  }, [selectedQuestion]);

  const loadCatalogs = async () => {
    try {
      setLoading(true);
      const data = await pollsApi.getCatalogs();
      setCatalogs(data);
    } catch (err) {
      setError("Failed to load catalogs");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadQuestions = async (catalogId: number) => {
    try {
      const data = await pollsApi.getQuestions(catalogId);
      setQuestions(data);
    } catch (err) {
      console.error("Failed to load questions:", err);
    }
  };

  const loadOptions = async (questionId: number) => {
    try {
      const data = await pollsApi.getOptions(questionId);
      setOptions(data);
    } catch (err) {
      console.error("Failed to load options:", err);
    }
  };

  const handleCatalogClick = (catalogId: number) => {
    setSelectedCatalog(catalogId);
    setSelectedQuestion(null);
  };

  const handleQuestionClick = (questionId: number) => {
    setSelectedQuestion(questionId);
  };

  const selectedCatalogData = selectedCatalog
    ? catalogs.find((c) => c.id === selectedCatalog)
    : null;
  const selectedQuestionData = selectedQuestion
    ? questions.find((q) => q.id === selectedQuestion)
    : null;

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg"></div>
          <p className="mt-4 text-base-content/70">Loading catalog...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <Icon icon="lineicons:warning" className="text-6xl mb-4 text-warning" />
          <h1 className="text-2xl font-bold text-base-content mb-4">Error</h1>
          <p className="text-base-content/70 mb-4">{error}</p>
          <button className="btn btn-primary" onClick={loadCatalogs}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-base-100 flex">
      {/* Main Catalog Sidebar */}
      <div className="w-64 bg-base-200 border-r border-base-300">
        <div className="p-4 border-b border-base-300">
          <h2 className="text-lg font-semibold text-base-content">
            Question Catalogs
          </h2>
          <button className="btn btn-primary btn-sm mt-2 w-full">
            + New Catalog
          </button>
        </div>
        <div className="p-2">
          {catalogs.map((catalog) => (
            <button
              key={catalog.id}
              onClick={() => handleCatalogClick(catalog.id)}
              className={`w-full text-left p-3 rounded-lg mb-1 transition-colors ${
                selectedCatalog === catalog.id
                  ? "bg-primary text-primary-content"
                  : "hover:bg-base-300 text-base-content"
              }`}
            >
              <div className="font-medium">{catalog.name}</div>
              <div className="text-sm opacity-70">
                {catalog.questionCount} questions
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Questions Sidebar */}
      {selectedCatalog && (
        <div className="w-80 bg-base-100 border-r border-base-300">
          <div className="p-4 border-b border-base-300">
            <h3 className="text-lg font-semibold text-base-content">
              {selectedCatalogData?.name} Questions
            </h3>
            <button className="btn btn-secondary btn-sm mt-2 w-full">
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
      )}

      {/* Main Content Area */}
      <div className="flex-1 p-6">
        {!selectedCatalog ? (
          <div className="text-center py-12">
            <Icon icon="lineicons:bar-chart" className="text-6xl mb-4 text-base-content/50" />
            <h1 className="text-3xl font-bold text-base-content mb-4">
              Poll Management Dashboard
            </h1>
            <p className="text-base-content/70 text-lg max-w-md mx-auto">
              Select a catalog from the sidebar to view and manage your
              questions.
            </p>
          </div>
        ) : !selectedQuestion ? (
          <div className="text-center py-12">
            <Icon icon="lineicons:notebook-1" className="text-5xl mb-4 text-base-content/50" />
            <h2 className="text-2xl font-bold text-base-content mb-4">
              {selectedCatalogData?.name}
            </h2>
            <p className="text-base-content/70">
              Select a question from the sidebar to view its details and manage
              options.
            </p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="bg-base-100 rounded-lg border border-base-300 p-6">
              <h3 className="text-2xl font-bold text-base-content mb-4">
                {selectedQuestionData?.title}
              </h3>
              <div className="prose prose-lg max-w-none mb-6">
                <p className="text-base-content/80 leading-relaxed">
                  {selectedQuestionData?.content}
                </p>
              </div>

              {/* Options Section */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-base-content">
                    Answer Options
                  </h4>
                  <button className="btn btn-accent btn-sm">
                    + Add Option
                  </button>
                </div>
                <div className="space-y-2">
                  {options.map((option) => (
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
                          <button className="btn btn-ghost btn-xs">Edit</button>
                          <button className="btn btn-ghost btn-xs text-error">
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button className="btn btn-primary">Edit Question</button>
                <button className="btn btn-outline">Create Poll</button>
                <button className="btn btn-ghost">Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
