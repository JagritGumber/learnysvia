import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import api from "@/utils/api";

interface School {
  school: {
    id: string;
    name: string;
    description: string | null;
    domain: string | null;
    createdAt: string;
  };
  role: string;
}

export const Route = createFileRoute("/_protected/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    domain: "",
  });
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      const response = await api.get("/api/schools");
      if (response.data.success) {
        setSchools(response.data.schools);
      }
    } catch (error) {
      console.error("Failed to fetch schools:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim()) return;

    setCreating(true);
    try {
      const response = await api.post("/api/schools/create", createForm);
      if (response.data.success) {
        setSchools((prev) => [
          ...prev,
          {
            school: response.data.school,
            role: "owner",
          },
        ]);
        setShowCreateForm(false);
        setCreateForm({ name: "", description: "", domain: "" });
      }
    } catch (error) {
      console.error("Failed to create school:", error);
    } finally {
      setCreating(false);
    }
  };

  const handleSchoolClick = (schoolId: string) => {
    navigate({ to: `/school/${schoolId}` });
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-base-100 flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-base-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-base-content mb-2">
              Your Schools
            </h1>
            <p className="text-base-content/70">
              Manage your educational institutions and classrooms
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateForm(true)}
          >
            Create School
          </button>
        </div>

        {schools.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏫</div>
            <h2 className="text-2xl font-semibold text-base-content mb-2">
              No schools yet
            </h2>
            <p className="text-base-content/70 mb-6">
              Create your first school to get started with online classrooms
            </p>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => setShowCreateForm(true)}
            >
              Create Your First School
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schools.map(({ school, role }) => (
              <div
                key={school.id}
                className="card bg-base-200 hover:bg-base-300 transition-colors cursor-pointer"
                onClick={() => handleSchoolClick(school.id)}
              >
                <div className="card-body">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="card-title text-lg">{school.name}</h3>
                    <div
                      className={`badge ${role === "owner" ? "badge-primary" : "badge-secondary"}`}
                    >
                      {role}
                    </div>
                  </div>
                  {school.description && (
                    <p className="text-base-content/70 text-sm mb-3">
                      {school.description}
                    </p>
                  )}
                  {school.domain && (
                    <div className="text-xs text-base-content/50 mb-3">
                      Domain: {school.domain}
                    </div>
                  )}
                  <div className="text-xs text-base-content/50">
                    Created {new Date(school.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create School Modal */}
        {showCreateForm && (
          <div className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg mb-4">Create New School</h3>
              <form onSubmit={handleCreateSchool}>
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">School Name *</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={createForm.name}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Enter school name"
                    required
                  />
                </div>
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Description</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered"
                    value={createForm.description}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Brief description of the school"
                    rows={3}
                  />
                </div>
                <div className="form-control mb-6">
                  <label className="label">
                    <span className="label-text">Domain (optional)</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={createForm.domain}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        domain: e.target.value,
                      }))
                    }
                    placeholder="school-domain.com"
                  />
                  <label className="label">
                    <span className="label-text-alt">
                      Custom domain for your school
                    </span>
                  </label>
                </div>
                <div className="modal-action">
                  <button
                    type="button"
                    className="btn"
                    onClick={() => setShowCreateForm(false)}
                    disabled={creating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={creating || !createForm.name.trim()}
                  >
                    {creating ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                      "Create School"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
