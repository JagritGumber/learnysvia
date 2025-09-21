import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { pollsApi } from "@/utils/polls-api";
import { Icon } from "@iconify/react";
import { useCatalogs } from "@/queries/catalogs";
import { CreateCatalogModal } from "@/components/modals/CreateCatalogModal";
import { useCatalogMutations } from "@/mutations/catalog";
import { useCatalogStore } from "@/store/catalog";
import { CatalogSidebar } from "@/components/catalog/CatalogSidebar";
import { CatalogQuestionsSidebar } from "@/components/catalog/CatalogQuestionsSidebar";
import { CatalogContent } from "@/components/catalog/CatalogContent";

export const Route = createFileRoute("/_protected/_dashboard/catalog")({
  component: CatalogPage,
});

function CatalogPage() {
  const {
    questions,
    options,
    selectedCatalog,
    selectedQuestion,
    showCreateModal,
    setQuestions,
    setOptions,
    setShowCreateModal,
  } = useCatalogStore();

  const { data: catalogs, isPending, error, refetch } = useCatalogs();
  const { createCatalog, deleteCatalog } = useCatalogMutations();

  // State for delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [catalogToDelete, setCatalogToDelete] = useState<string | null>(null);

  // Load questions when catalog changes
  useEffect(() => {
    if (selectedCatalog) {
      loadQuestions(parseInt(selectedCatalog));
    } else {
      setQuestions([]);
    }
  }, [selectedCatalog, setQuestions]);

  // Load options when question changes
  useEffect(() => {
    if (selectedQuestion) {
      loadOptions(selectedQuestion);
    } else {
      setOptions([]);
    }
  }, [selectedQuestion, setOptions]);

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

  const selectedCatalogData = selectedCatalog
    ? catalogs?.find((c) => c.id === selectedCatalog)
    : null;
  const selectedQuestionData = selectedQuestion
    ? questions.find((q) => q.id === selectedQuestion)
    : null;

  // Event handlers
  const handleCreateCatalog = () => {
    setShowCreateModal(true);
  };

  const handleCreateQuestion = () => {
    // TODO: Implement create question functionality
    console.log("Create question clicked");
  };

  const handleDeleteCatalog = (catalogId: string) => {
    setCatalogToDelete(catalogId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (catalogToDelete) {
      try {
        await deleteCatalog.mutateAsync({ id: catalogToDelete });
        setShowDeleteModal(false);
        setCatalogToDelete(null);
      } catch (error) {
        console.error("Failed to delete catalog:", error);
      }
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setCatalogToDelete(null);
  };

  const handleEditQuestion = () => {
    // TODO: Implement edit question functionality
    console.log("Edit question clicked");
  };

  const handleCreatePoll = () => {
    // TODO: Implement create poll functionality
    console.log("Create poll clicked");
  };

  const handleDeleteQuestion = () => {
    // TODO: Implement delete question functionality
    console.log("Delete question clicked");
  };

  const handleAddOption = () => {
    // TODO: Implement add option functionality
    console.log("Add option clicked");
  };

  const handleEditOption = (optionId: number) => {
    // TODO: Implement edit option functionality
    console.log("Edit option clicked:", optionId);
  };

  const handleDeleteOption = (optionId: number) => {
    // TODO: Implement delete option functionality
    console.log("Delete option clicked:", optionId);
  };

  if (isPending) {
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
          <Icon
            icon="lineicons:warning"
            className="text-6xl mb-4 text-warning"
          />
          <h1 className="text-2xl font-bold text-base-content mb-4">Error</h1>
          <p className="text-base-content/70 mb-4">{error.message}</p>
          <button className="btn btn-primary" onClick={() => refetch()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-base-100 flex">
      {/* Left Sidebar - Catalogs */}
      <CatalogSidebar
        catalogs={catalogs || []}
        onCreateCatalog={handleCreateCatalog}
      />

      {/* Middle Panel - Questions */}
      {selectedCatalog && (
        <CatalogQuestionsSidebar
          questions={questions}
          selectedCatalogData={selectedCatalogData ?? null}
          onDeleteCatalog={() => handleDeleteCatalog(selectedCatalog)}
          onCreateQuestion={handleCreateQuestion}
        />
      )}

      {/* Right Panel - Main Content */}
      <CatalogContent
        selectedCatalogData={selectedCatalogData ?? null}
        selectedQuestionData={selectedQuestionData ?? null}
        options={options}
        onEditQuestion={handleEditQuestion}
        onCreatePoll={handleCreatePoll}
        onDeleteQuestion={handleDeleteQuestion}
        onAddOption={handleAddOption}
        onEditOption={handleEditOption}
        onDeleteOption={handleDeleteOption}
      />

      {/* Create Catalog Modal */}
      {showCreateModal && (
        <CreateCatalogModal
          onClose={() => setShowCreateModal(false)}
          onCreate={(data) => createCatalog.mutateAsync(data)}
        />
      )}

      {showDeleteModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Delete Catalog</h3>
            <p className="py-4">
              Are you sure you want to delete this catalog? This action cannot
              be undone and will also delete all questions and options
              associated with this catalog.
            </p>
            <div className="modal-action">
              <button
                className="btn"
                onClick={handleCancelDelete}
                disabled={deleteCatalog.isPending}
              >
                Cancel
              </button>
              <button
                className="btn btn-error"
                onClick={handleConfirmDelete}
                disabled={deleteCatalog.isPending}
              >
                {deleteCatalog.isPending ? (
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
        </div>
      )}
    </div>
  );
}
