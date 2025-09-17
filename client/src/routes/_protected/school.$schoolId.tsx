import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import api from "@/utils/api";

interface School {
  id: string;
  name: string;
  description: string | null;
  domain: string | null;
  createdAt: string;
}

interface Class {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  isArchived: boolean;
}

interface Membership {
  role: string;
}

export const Route = createFileRoute("/_protected/school/$schoolId")({
  component: SchoolDetail,
});

function SchoolDetail() {
  const { schoolId } = Route.useParams();
  const [school, setSchool] = useState<School | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
  });
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSchoolData();
  }, [schoolId]);

  const fetchSchoolData = async () => {
    try {
      const [schoolResponse, classesResponse] = await Promise.all([
        api.get(`/api/schools/school/${schoolId}`),
        api.get(`/api/schools/${schoolId}/classes`),
      ]);

      if (schoolResponse.data.success) {
        setSchool(schoolResponse.data.school);
        setMembership(schoolResponse.data.membership);
      }

      if (classesResponse.data.success) {
        setClasses(classesResponse.data.classes);
      }
    } catch (error) {
      console.error("Failed to fetch school data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim()) return;

    setCreating(true);
    try {
      const response = await api.post(`/api/schools/${schoolId}/classes`, createForm);
      if (response.data.success) {
        setClasses(prev => [...prev, response.data.class]);
        setShowCreateForm(false);
        setCreateForm({ name: "", description: "" });
      }
    } catch (error) {
      console.error("Failed to create class:", error);
    } finally {
      setCreating(false);
    }
  };

  const handleClassClick = (classId: string) => {
    navigate({ to: `/class/${classId}` });
  };

  const canCreateClass = membership?.role === "owner" ||
                        membership?.role === "admin" ||
                        membership?.role === "teacher";

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-base-100 flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-base-content mb-4">School Not Found</h1>
          <p className="text-base-content/70">The school you're looking for doesn't exist or you don't have access to it.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-base-100 p-4 md:p-6 lg:p-8">
      <div className="w-full">
        {/* School Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-base-content mb-2">{school.name}</h1>
              {school.description && (
                <p className="text-base-content/70 text-base md:text-lg">{school.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <div className={`badge ${membership?.role === 'owner' ? 'badge-primary' : 'badge-secondary'}`}>
                  {membership?.role}
                </div>
                {school.domain && (
                  <div className="text-sm text-base-content/50">
                    Domain: {school.domain}
                  </div>
                )}
              </div>
            </div>
            {canCreateClass && (
              <button
                className="btn btn-primary w-full lg:w-auto"
                onClick={() => setShowCreateForm(true)}
              >
                Create Class
              </button>
            )}
          </div>
        </div>

        {/* Classes Section */}
        <div>
          <h2 className="text-2xl font-semibold text-base-content mb-6">Classes</h2>

          {classes.length === 0 ? (
            <div className="text-center py-12 px-4 bg-base-200 rounded-lg">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-base-content mb-2">No classes yet</h3>
              <p className="text-base-content/70 mb-6 max-w-md mx-auto">
                {canCreateClass
                  ? "Create your first class to start teaching"
                  : "Classes will appear here once they're created"
                }
              </p>
              {canCreateClass && (
                <button
                  className="btn btn-primary"
                  onClick={() => setShowCreateForm(true)}
                >
                  Create First Class
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
              {classes
                .filter(cls => !cls.isArchived)
                .map((cls) => (
                  <div
                    key={cls.id}
                    className="card bg-base-200 hover:bg-base-300 transition-all duration-200 cursor-pointer hover:shadow-lg"
                    onClick={() => handleClassClick(cls.id)}
                  >
                    <div className="card-body p-4 md:p-6">
                      <h3 className="card-title text-base md:text-lg leading-tight">{cls.name}</h3>
                      {cls.description && (
                        <p className="text-base-content/70 text-sm mb-3 line-clamp-2">{cls.description}</p>
                      )}
                      <div className="text-xs text-base-content/50">
                        Created {new Date(cls.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Create Class Modal */}
        {showCreateForm && (
          <div className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg mb-4">Create New Class</h3>
              <form onSubmit={handleCreateClass}>
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Class Name *</span>
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
                    placeholder="Enter class name"
                    required
                  />
                </div>
                <div className="form-control mb-6">
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
                    placeholder="Brief description of the class"
                    rows={3}
                  />
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
                      "Create Class"
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
