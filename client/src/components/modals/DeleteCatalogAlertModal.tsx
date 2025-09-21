import { useCatalogMutations } from "@/mutations/catalogs.mutations";
import { useCatalogStore } from "@/store/catalog";
import { Icon } from "@iconify/react";

export const DeleteCatalogAlertModal = () => {
  const { setShowDeleteModal } = useCatalogStore.getState();
  const selectedCatalog = useCatalogStore((state) => state.selectedCatalog);
  const { deleteCatalog } = useCatalogMutations();

  const handleConfirmDelete = async () => {
    if (selectedCatalog) {
      try {
        await deleteCatalog.mutateAsync({ id: selectedCatalog });
        setShowDeleteModal(false);
      } catch (error) {
        console.error("Failed to delete catalog:", error);
      }
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Delete Catalog</h3>
        <p className="py-4">
          Are you sure you want to delete this catalog? This action cannot be
          undone and will also delete all questions and options associated with
          this catalog.
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
  );
};
