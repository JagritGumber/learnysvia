import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/utils/api";
import { CalendarView } from "@/components/CalendarView";

interface Lesson {
  id: string;
  name: string;
  description: string;
  scheduledDate: Date | null;
  scheduledTime: string | null;
  duration: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export const Route = createFileRoute("/_protected/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const [lessonName, setLessonName] = useState("");
  const [lessonDescription, setLessonDescription] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [duration, setDuration] = useState(60);
  const [isStartNow, setIsStartNow] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  // Fetch lessons
  const {
    data: lessonsData,
    isLoading: lessonsLoading,
    refetch: refetchLessons,
  } = useQuery({
    queryKey: ["lessons"],
    queryFn: async () => {
      const response = await api.get("/api/lessons");
      return response.data.lessons.map((lesson: any) => ({
        ...lesson,
        scheduledDate: lesson.scheduledDate
          ? new Date(lesson.scheduledDate)
          : null,
        createdAt: new Date(lesson.createdAt),
        updatedAt: new Date(lesson.updatedAt),
      }));
    },
  });

  const lessons = lessonsData || [];

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await api.post("/api/lessons/create", {
        name: lessonName,
        description: lessonDescription,
        scheduledDate: scheduledDate || undefined,
        scheduledTime: scheduledTime || undefined,
        duration,
      });

      console.log("Lesson created:", response.data.lesson);

      // Reset form
      setLessonName("");
      setLessonDescription("");
      setScheduledDate("");
      setScheduledTime("");
      setDuration(60);
      setIsStartNow(false);

      // Close modal
      (
        document.getElementById("create-lesson-modal") as HTMLDialogElement
      )?.close();

      // Refetch lessons
      refetchLessons();
    } catch (error) {
      console.error("Error creating lesson:", error);
      // TODO: Show error message to user
    }
  };

  const handleCancel = () => {
    setLessonName("");
    setLessonDescription("");
    setScheduledDate("");
    setScheduledTime("");
    setDuration(60);
    setIsStartNow(false);
    (
      document.getElementById("create-lesson-modal") as HTMLDialogElement
    )?.close();
  };

  const handleLessonClick = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    (
      document.getElementById("lesson-details-modal") as HTMLDialogElement
    )?.showModal();
  };

  const handleDateClick = (date: Date) => {
    setScheduledDate(date.toISOString().split("T")[0]);
    (
      document.getElementById("create-lesson-modal") as HTMLDialogElement
    )?.showModal();
  };

  const handleStartLesson = (lesson: Lesson) => {
    // For immediate lessons, navigate directly to the lesson
    // For scheduled lessons, you might want to check if it's time to start
    const lessonUrl = `/lesson/${lesson.id}`;
    console.log("Starting lesson:", lesson.name, "URL:", lessonUrl);

    // For now, just log the action. In a real app, you would navigate to the lesson page
    // You could use React Router's navigate function here
    // navigate(lessonUrl);

    // For immediate lessons, we could show a different message or behavior
    if (!lesson.scheduledDate) {
      console.log("Starting immediate lesson:", lesson.name);
    } else {
      console.log("Starting scheduled lesson:", lesson.name);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-base-100">
      <div className="pb-8 px-6 pt-0">
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
          <div className="modal-box max-w-md shadow-none">
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
                  rows={3}
                  value={lessonDescription}
                  onChange={(e) => setLessonDescription(e.target.value)}
                  required
                />
              </div>

              {/* Start Now Toggle */}
              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">Start lesson immediately</span>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={isStartNow}
                    onChange={(e) => {
                      setIsStartNow(e.target.checked);
                      if (e.target.checked) {
                        // Clear date/time when switching to "Start Now"
                        setScheduledDate("");
                        setScheduledTime("");
                      }
                    }}
                  />
                </label>
              </div>

              {/* Date/Time fields - only show when not "Start Now" */}
              {!isStartNow && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-control flex flex-col gap-2">
                    <label className="label">
                      <span className="label-text">Date</span>
                    </label>
                    <input
                      type="date"
                      className="input input-bordered w-full"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                    />
                  </div>
                  <div className="form-control flex flex-col gap-2">
                    <label className="label">
                      <span className="label-text">Time</span>
                    </label>
                    <input
                      type="time"
                      className="input input-bordered w-full"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                    />
                  </div>
                </div>
              )}
              <div className="form-control flex flex-col gap-2">
                <label className="label">
                  <span className="label-text">Duration (minutes)</span>
                </label>
                <input
                  type="number"
                  min="15"
                  max="480"
                  step="15"
                  className="input input-bordered w-full"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
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

        {/* Lesson Details Modal */}
        <dialog id="lesson-details-modal" className="modal">
          <div className="modal-box">
            <h2 className="text-lg font-bold">Lesson Details</h2>
            {selectedLesson && (
              <div className="space-y-4 mt-4">
                <div>
                  <h3 className="font-semibold text-lg">
                    {selectedLesson.name}
                  </h3>
                  <p className="text-base-content/70">
                    {selectedLesson.description}
                  </p>
                </div>
                <div className="space-y-2">
                  {!selectedLesson.scheduledDate ? (
                    <div className="flex items-center gap-2">
                      <span className="badge badge-primary">Immediate</span>
                      <span className="text-sm text-base-content/60">
                        This lesson can be started right away
                      </span>
                    </div>
                  ) : (
                    <div className="flex gap-4">
                      <div>
                        <span className="font-medium">Date:</span>{" "}
                        {selectedLesson.scheduledDate.toLocaleDateString()}
                      </div>
                      {selectedLesson.scheduledTime && (
                        <div>
                          <span className="font-medium">Time:</span>{" "}
                          {selectedLesson.scheduledTime}
                        </div>
                      )}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Duration:</span>{" "}
                    {selectedLesson.duration} minutes
                  </div>
                </div>
              </div>
            )}
            <div className="modal-action">
              <form method="dialog">
                <button className="btn">Close</button>
              </form>
            </div>
          </div>
        </dialog>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Calendar Section - Full Width */}
          <div>
            {lessonsLoading ? (
              <div className="card bg-base-100 border border-base-300 shadow-none">
                <div className="card-body">
                  <div className="skeleton h-8 w-48 mb-4"></div>
                  <div className="skeleton h-96 w-full"></div>
                </div>
              </div>
            ) : (
              <CalendarView
                lessons={lessons}
                onLessonClick={handleLessonClick}
                onDateClick={handleDateClick}
                onStartLesson={handleStartLesson}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
