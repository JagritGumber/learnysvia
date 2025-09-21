import { useState } from "react";
import { Icon } from "@iconify/react";
import { useCatalogs } from "@/queries/catalogs.query";
import { useCatalogQuestions } from "@/queries/questions.query";
import { useQuestionById } from "@/queries/questionById.query";

interface CreatePollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePoll: (questionId: string) => void;
}

export function CreatePollModal({
  isOpen,
  onClose,
  onCreatePoll,
}: CreatePollModalProps) {
  const [selectedCatalog, setSelectedCatalog] = useState<string>("");
  const [selectedQuestion, setSelectedQuestion] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { data: catalogs } = useCatalogs();
  const { data: questionsData, isPending: questionsLoading } =
    useCatalogQuestions(selectedCatalog);
  const { data: questionData } = useQuestionById(
    selectedCatalog,
    selectedQuestion
  );

  const handleCatalogClick = (catalogId: string) => {
    setSelectedCatalog(catalogId);
    setSelectedQuestion(""); // Reset question selection when catalog changes
  };

  const handleQuestionClick = (questionId: string) => {
    setSelectedQuestion(questionId);
  };

  const handleCreatePoll = () => {
    if (selectedQuestion) {
      onCreatePoll(selectedQuestion);
      onClose();
      // Reset state
      setSelectedCatalog("");
      setSelectedQuestion("");
      setSearchQuery("");
    }
  };

  const filteredCatalogs = catalogs?.filter((catalog) =>
    catalog.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-6xl h-[80vh] p-0">
        <div className="flex h-full">
          {/* Left Sidebar - Catalogs */}
          <div className="w-80 bg-base-100 border-r border-base-300 flex flex-col">
            <div className="p-4 border-b border-base-300">
              <h3 className="text-lg font-semibold text-base-content mb-3">
                Question Catalogs
              </h3>

              {/* NLP Search */}
              <div className="form-control">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search catalogs or describe what you need..."
                    className="input input-bordered input-sm w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Icon
                    icon="lineicons:search"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none z-10 fill-base-content"
                  />
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {filteredCatalogs?.map((catalog) => (
                <button
                  key={catalog.id}
                  onClick={() => handleCatalogClick(catalog.id)}
                  className={`w-full text-left p-3 rounded-lg mb-1 transition-colors flex justify-between items-center ${
                    selectedCatalog === catalog.id
                      ? "bg-accent text-accent-content"
                      : "hover:bg-base-200 text-base-content"
                  }`}
                >
                  <div>
                    <div className="font-medium text-sm">{catalog.name}</div>
                    <div className="text-xs opacity-70">
                      {catalog.questionCount} questions
                    </div>
                  </div>
                  <Icon
                    icon="lineicons:chevron-right"
                    className="w-4 h-4 opacity-50"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Middle - Questions */}
          <div className="flex-1 bg-base-200 flex flex-col">
            {selectedCatalog ? (
              questionsLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              ) : questionsData?.questions &&
                questionsData.questions.length > 0 ? (
                <div className="flex-1 flex flex-col">
                  <div className="p-4 border-b border-base-300">
                    <h4 className="font-semibold text-base-content">
                      {questionsData.name} Questions
                    </h4>
                    <p className="text-sm text-base-content/70">
                      {questionsData.questions.length} questions available
                    </p>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="grid gap-3">
                      {questionsData.questions.map((question) => (
                        <button
                          key={question.id}
                          onClick={() => handleQuestionClick(question.id)}
                          className={`w-full text-left p-4 rounded-lg border transition-colors ${
                            selectedQuestion === question.id
                              ? "border-accent bg-accent/10"
                              : "border-base-300 hover:border-base-content/30 bg-base-100"
                          }`}
                        >
                          <div className="font-medium text-sm line-clamp-2 mb-2">
                            {question.text}
                          </div>
                          <div className="text-xs text-base-content/60">
                            Click to preview and select
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <Icon
                      icon="lineicons:document"
                      className="text-6xl mb-4 text-base-content/30"
                    />
                    <h4 className="font-semibold text-base-content mb-2">
                      No Questions Found
                    </h4>
                    <p className="text-base-content/70 text-sm">
                      This catalog doesn't have any questions yet.
                    </p>
                  </div>
                </div>
              )
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <Icon
                    icon="lineicons:folder"
                    className="text-6xl mb-4 text-base-content/30"
                  />
                  <h4 className="font-semibold text-base-content mb-2">
                    Select a Catalog
                  </h4>
                  <p className="text-base-content/70 text-sm">
                    Choose a catalog from the sidebar to browse questions.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar - Question Preview */}
          <div className="w-96 bg-base-100 border-l border-base-300 flex flex-col">
            <div className="p-4 border-b border-base-300">
              <h4 className="font-semibold text-base-content">
                Question Preview
              </h4>
            </div>

            <div className="flex-1 p-4">
              {selectedQuestion && questionData?.question ? (
                <div>
                  <h5 className="font-medium text-base-content mb-4">
                    {questionData.question.text}
                  </h5>

                  {questionData.question.options &&
                  questionData.question.options.length > 0 ? (
                    <div>
                      <h6 className="font-medium text-sm text-base-content mb-3">
                        Answer Options:
                      </h6>
                      <div className="space-y-2">
                        {questionData.question.options.map((option) => (
                          <div
                            key={option.id}
                            className={`p-2 rounded text-sm ${
                              option.isCorrect
                                ? "bg-success/10 border border-success/30"
                                : "bg-base-200"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span>{option.text}</span>
                              {option.isCorrect && (
                                <Icon
                                  icon="lineicons:check-circle"
                                  className="w-4 h-4 text-success"
                                />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-base-content/60">
                      <Icon
                        icon="lineicons:plus-circle"
                        className="text-4xl mb-2 text-base-content/30"
                      />
                      <p className="text-sm">No options available</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Icon
                      icon="lineicons:eye"
                      className="text-6xl mb-4 text-base-content/30"
                    />
                    <p className="text-base-content/70 text-sm">
                      Select a question to preview
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="p-4 border-t border-base-300">
              <div className="flex gap-2">
                <button className="btn btn-ghost flex-1" onClick={onClose}>
                  Cancel
                </button>
                <button
                  className="btn btn-primary flex-1"
                  disabled={!selectedQuestion}
                  onClick={handleCreatePoll}
                >
                  <Icon icon="lineicons:plus" className="w-4 h-4 mr-2" />
                  Create Poll
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
