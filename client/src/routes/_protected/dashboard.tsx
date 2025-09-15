import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import api from "@/utils/api";

export const Route = createFileRoute("/_protected/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const [lessonName, setLessonName] = useState("");
  const [lessonDescription, setLessonDescription] = useState("");

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await api.post("/api/lessons/create", {
        name: lessonName,
        description: lessonDescription,
      });

      console.log("Lesson created:", response.data.lesson);

      // Reset form
      setLessonName("");
      setLessonDescription("");

      // Close modal
      (
        document.getElementById("create-lesson-modal") as HTMLDialogElement
      )?.close();

      // TODO: Navigate to the created lesson or update UI to show it
    } catch (error) {
      console.error("Error creating lesson:", error);
      // TODO: Show error message to user
    }
  };

  const handleCancel = () => {
    setLessonName("");
    setLessonDescription("");
    (
      document.getElementById("create-lesson-modal") as HTMLDialogElement
    )?.close();
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-base-100">
      <div className="py-8 px-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
            <p className="text-lg text-base-content/70">
              Manage your lessons and track student progress
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() =>
              (
                document.getElementById(
                  "create-lesson-modal"
                ) as HTMLDialogElement
              )?.showModal()
            }
          >
            Create Lesson
          </button>
        </div>

        {/* Create Lesson Modal */}
        <dialog id="create-lesson-modal" className="modal">
          <div className="modal-box">
            <h2 className="text-lg font-bold">Create New Lesson</h2>
            <form onSubmit={handleFormSubmit} className="space-y-4 mt-4">
              <div className="form-control flex flex-col gap-2">
                <label className="label">
                  <span className="label-text">Lesson Name</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter lesson name"
                  className="input input-bordered w-full"
                  value={lessonName}
                  onChange={(e) => setLessonName(e.target.value)}
                  required
                />
              </div>
              <div className="form-control flex flex-col gap-2">
                <label className="label">
                  <span className="label-text">What is the lesson about?</span>
                </label>
                <textarea
                  placeholder="Describe what this lesson will cover..."
                  className="textarea textarea-bordered w-full"
                  rows={4}
                  value={lessonDescription}
                  onChange={(e) => setLessonDescription(e.target.value)}
                  required
                />
              </div>
              <div className="modal-action">
                <form method="dialog">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                </form>
                <button type="submit" className="btn btn-primary">
                  Create Lesson
                </button>
              </div>
            </form>
          </div>
        </dialog>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Upcoming Lessons Schedule */}
          <div className="card bg-base-100 border border-base-300">
            <div className="card-body">
              <h2 className="card-title">Upcoming Lessons</h2>
              <div className="space-y-4">
                {/* Empty state for schedule */}
                <div className="text-center py-12 text-base-content/60">
                  <div className="text-6xl mb-4">📅</div>
                  <p className="text-lg font-medium">No lessons scheduled</p>
                  <p className="text-sm mb-4">
                    Create your first lesson to see it in the schedule
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={() =>
                      (
                        document.getElementById(
                          "create-lesson-modal"
                        ) as HTMLDialogElement
                      )?.showModal()
                    }
                  >
                    Create Your First Lesson
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
