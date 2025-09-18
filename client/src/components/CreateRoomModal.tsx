import { useState } from "react";
import { type CreateRoomData } from "../utils/rooms-api";

interface CreateRoomModalProps {
  onClose: () => void;
  onCreate: (data: CreateRoomData) => Promise<void>;
}

export function CreateRoomModal({ onClose, onCreate }: CreateRoomModalProps) {
  const [formData, setFormData] = useState<CreateRoomData>({
    name: "",
    description: "",
    isPublic: true,
    maxParticipants: 50,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setLoading(true);
    try {
      await onCreate(formData);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof CreateRoomData,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-base-content">
              Create New Room
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
            {/* Room Name */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Room Name *</span>
              </label>
              <input
                type="text"
                placeholder="Enter room name"
                className="input input-bordered w-full"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
                maxLength={100}
              />
            </div>

            {/* Description */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Description</span>
              </label>
              <textarea
                placeholder="Describe your room (optional)"
                className="textarea textarea-bordered w-full resize-none"
                rows={3}
                value={formData.description || ""}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                maxLength={500}
              />
            </div>

            {/* Settings Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Max Participants */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">
                    Max Participants
                  </span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={1000}
                  className="input input-bordered w-full"
                  value={formData.maxParticipants || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    handleInputChange(
                      "maxParticipants",
                      value === "" ? 50 : parseInt(value) || 50
                    );
                  }}
                />
              </div>

              {/* Public/Private */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Visibility</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={formData.isPublic ? "public" : "private"}
                  onChange={(e) =>
                    handleInputChange("isPublic", e.target.value === "public")
                  }
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
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
                  "Create Room"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
