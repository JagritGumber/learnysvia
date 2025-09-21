import { useCatalogs } from "@/queries/catalogs";
import { useCatalogStore } from "@/store/catalog";
import { AutoSizeLoader } from "../core/AutoSizeLoader";

interface CatalogSidebarProps {}

export function CatalogSidebar({}: CatalogSidebarProps) {
  const { data: catalogs, isPending, error } = useCatalogs();
  const selectedCatalog = useCatalogStore((state) => state.selectedCatalog);

  const { setSelectedCatalog, setSelectedQuestion, setShowCreateModal } =
    useCatalogStore.getState();

  const handleCatalogClick = (catalogId: string) => {
    setSelectedCatalog(catalogId);
    setSelectedQuestion(null);
  };

  const handleCreateCatalog = () => {
    setShowCreateModal(true);
  };

  if (isPending) {
    return <AutoSizeLoader />;
  }

  if (error) {
    return null;
  }

  return (
    <div className="w-64 bg-base-100 border-r border-base-300">
      <div className="p-4 border-b border-base-300">
        <h2 className="text-lg font-semibold text-base-content">
          Question Catalogs
        </h2>
        <button
          className="btn btn-primary btn-sm mt-2 w-full"
          onClick={handleCreateCatalog}
        >
          + New Catalog
        </button>
      </div>
      <div className="p-2">
        {catalogs?.map((catalog) => (
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
  );
}
