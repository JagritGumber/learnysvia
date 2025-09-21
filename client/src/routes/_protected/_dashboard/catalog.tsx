import { createFileRoute } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { useCatalogs } from "@/queries/catalogs";
import { CreateCatalogModal } from "@/components/modals/CreateCatalogModal";
import { useCatalogMutations } from "@/mutations/catalog";
import { useCatalogStore } from "@/store/catalog";
import { CatalogSidebar } from "@/components/catalog/CatalogSidebar";
import { CatalogQuestionsSidebar } from "@/components/catalog/CatalogQuestionsSidebar";
import { CatalogContent } from "@/components/catalog/CatalogContent";
import { FullScreenLoader } from "@/components/core/FullScreenLoader";
import { DeleteCatalogAlertModal } from "@/components/modals/DeleteCatalogAlertModal";

export const Route = createFileRoute("/_protected/_dashboard/catalog")({
  component: CatalogPage,
});

function CatalogPage() {
  const { setShowCreateModal } = useCatalogStore.getState();
  const selectedCatalog = useCatalogStore((state) => state.selectedCatalog);
  const showCreateModal = useCatalogStore((state) => state.showCreateModal);
  const showDeleteModal = useCatalogStore((state) => state.showDeleteModal);

  const { isPending, error, refetch } = useCatalogs();
  const { createCatalog } = useCatalogMutations();

  if (isPending) {
    return <FullScreenLoader />;
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
      <CatalogSidebar />

      {selectedCatalog && <CatalogQuestionsSidebar />}

      <CatalogContent />

      {showCreateModal && (
        <CreateCatalogModal
          onClose={() => setShowCreateModal(false)}
          onCreate={(data) => createCatalog.mutateAsync(data)}
        />
      )}

      {showDeleteModal && <DeleteCatalogAlertModal />}
    </div>
  );
}
