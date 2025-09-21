import { useState } from "react";
import type { CreateCatalog } from "@/shared/types/catalog";

interface CreateCatalogModalProps {
  onClose: () => void;
  onCreate: (data: CreateCatalog) => Promise<void>;
}

export function CreateCatalogModal({ onClose, onCreate }: CreateCatalogModalProps) {
  const [formData, setFormData] = useState<CreateCatalog>({
    name: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setLoading(true);
    try {
      await onCreate(formData);
      onClose(); // Close modal on successful catalog creation
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof CreateCatalog,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div
      id="create-catalog-modal"
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <div className="bg-base-100 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-base-content">
              Create New Catalog
            </h2>
            <button
              onClick={onClose}
              className="btn btn-ghost btn-sm btn-circle"
            >
              ✕
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Catalog Name */}
            <div className="form-control flex flex-col gap-1">
              <label className="label">
                <span className="label-text font-medium">Catalog Name *</span>
              </label>
              <input
                type="text"
                placeholder="Enter catalog name"
                className="input input-bordered w-full"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
                maxLength={100}
              />
            </div>

            {/* Description */}
            <div className="form-control flex flex-col gap-1">
              <label className="label">
                <span className="label-text font-medium">Description</span>
              </label>
              <textarea
                placeholder="Describe your catalog (optional)"
                className="textarea textarea-bordered w-full resize-none"
                rows={3}
                value={formData.description || ""}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                maxLength={500}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-ghost flex-1"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary flex-1"
                disabled={loading || !formData.name.trim()}
              >
                {loading ? (
                  <>
                    <div className="loading loading-spinner loading-sm"></div>
                    Creating...
                  </>
                ) : (
                  "Create Catalog"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
