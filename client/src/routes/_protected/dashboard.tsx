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
  const [error, setError] = useState("");
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
    setError("");

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
        setError("");
      }
    } catch (err: any) {
      // Normalize common error shapes
      const message =
        err?.message ||
        err?.error ||
        (typeof err === "string" ? err : null) ||
        "An unexpected error occurred";
      setError(message);
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
    <div className="min-h-[calc(100vh-64px)] bg-base-100 p-4 md:p-6 lg:p-8">
      <div className="w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-base-content mb-2">
              Your Schools
            </h1>
            <p className="text-base-content/70">
              Manage your educational institutions and classrooms
            </p>
          </div>
          <button
            className="btn btn-primary w-full md:w-auto"
            onClick={() => setShowCreateForm(true)}
          >
            Create School
          </button>
        </div>

        {schools.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="text-6xl mb-4">🏫</div>
            <h2 className="text-2xl font-semibold text-base-content mb-2">
              No schools yet
            </h2>
            <p className="text-base-content/70 mb-6 max-w-md mx-auto">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
            {schools.map(({ school, role }) => (
              <div
                key={school.id}
                className="card bg-base-200 hover:bg-base-300 transition-all duration-200 cursor-pointer hover:shadow-lg"
                onClick={() => handleSchoolClick(school.id)}
              >
                <div className="card-body p-4 md:p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="card-title text-base md:text-lg leading-tight">
                      {school.name}
                    </h3>
                    <div
                      className={`badge badge-sm ${role === "owner" ? "badge-primary" : "badge-secondary"}`}
                    >
                      {role}
                    </div>
                  </div>
                  {school.description && (
                    <p className="text-base-content/70 text-sm mb-3 line-clamp-2">
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
            <div className="modal-box max-w-md">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Create New School</h2>
                  <p className="text-sm text-base-content/70">
                    Set up your educational institution
                  </p>
                </div>
              </div>

              <form className="space-y-4" onSubmit={handleCreateSchool}>
                {error && (
                  <div className="alert alert-error shadow-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="stroke-current shrink-0 h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{error}</span>
                  </div>
                )}

                <div className="form-control flex flex-col gap-2">
                  <label className="label">
                    <span className="label-text">School Name *</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
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

                <div className="form-control flex flex-col gap-2">
                  <label className="label">
                    <span className="label-text">Description</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered w-full"
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

                <div className="form-control flex flex-col gap-2">
                  <label className="label">
                    <span className="label-text">Domain (optional)</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
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

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={creating || !createForm.name.trim()}
                    className="btn btn-primary btn-block btn-lg"
                  >
                    {creating ? (
                      <>
                        <span className="loading loading-spinner loading-sm mr-2"></span>
                        Creating...
                      </>
                    ) : (
                      "Create School"
                    )}
                  </button>
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setShowCreateForm(false)}
                    disabled={creating}
                  >
                    Cancel
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
