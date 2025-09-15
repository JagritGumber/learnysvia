import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import { Icon } from "@iconify/react";

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

interface CalendarViewProps {
  lessons: Lesson[];
  onLessonClick: (lesson: Lesson) => void;
  onDateClick: (date: Date) => void;
  onStartLesson?: (lesson: Lesson) => void;
}

// Mini Calendar Component (Small month view)
function MiniCalendar({
  currentMonth,
  selectedDate,
  lessons,
  onDateClick,
  onMonthChange,
}: {
  currentMonth: Date;
  selectedDate: Date;
  lessons: Lesson[];
  onDateClick: (date: Date) => void;
  onMonthChange: (date: Date) => void;
}) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getLessonsForDate = (date: Date) => {
    return lessons.filter(
      (lesson) =>
        lesson.scheduledDate && isSameDay(new Date(lesson.scheduledDate), date)
    );
  };

  const previousMonth = () => {
    onMonthChange(subMonths(currentMonth, 1));
  };

  const nextMonth = () => {
    onMonthChange(addMonths(currentMonth, 1));
  };

  return (
    <div className="card bg-base-100 border border-base-300 shadow-none">
      <div className="card-body p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">
            {format(currentMonth, "MMMM yyyy")}
          </h3>
          <div className="flex gap-1">
            <button
              className="btn btn-xs btn-circle btn-ghost"
              onClick={previousMonth}
            >
              <Icon icon="heroicons:chevron-left" className="size-4" />
            </button>
            <button
              className="btn btn-xs btn-circle btn-ghost"
              onClick={nextMonth}
            >
              <Icon icon="heroicons:chevron-right" className="size-4" />
            </button>
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-base-content/60 p-1"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day) => {
            const dayLessons = getLessonsForDate(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isToday = isSameDay(day, new Date());
            const isSelected = isSameDay(day, selectedDate);

            return (
              <div
                key={day.toISOString()}
                className={`h-8 w-8 flex items-center justify-center text-xs cursor-pointer rounded-full transition-all duration-200 ${
                  isSelected
                    ? "bg-primary text-primary-content font-bold"
                    : isToday
                      ? "bg-primary/20 text-primary font-bold"
                      : isCurrentMonth
                        ? "hover:bg-base-200 text-base-content"
                        : "text-base-content/30"
                }`}
                onClick={() => onDateClick(day)}
              >
                {format(day, "d")}
                {dayLessons.length > 0 && !isSelected && (
                  <div className="absolute top-0 right-0 w-1 h-1 bg-primary rounded-full"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Lesson List Item Component
function LessonListItem({
  lesson,
  onLessonClick,
  onStartLesson,
}: {
  lesson: Lesson;
  onLessonClick: (lesson: Lesson) => void;
  onStartLesson?: (lesson: Lesson) => void;
}) {
  const handleCopyLink = async () => {
    const lessonUrl = `${window.location.origin}/lesson/${lesson.id}`;
    try {
      await navigator.clipboard.writeText(lessonUrl);
      // You could add a toast notification here
      console.log("Lesson link copied to clipboard:", lessonUrl);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleStartLesson = () => {
    if (onStartLesson) {
      onStartLesson(lesson);
    }
  };

  const formatDateTime = () => {
    if (!lesson.scheduledDate) return "No date set";
    const date = new Date(lesson.scheduledDate);
    const dateStr = format(date, "MMM d, yyyy");
    const timeStr = lesson.scheduledTime || "No time set";
    return `${dateStr} at ${timeStr}`;
  };

  const truncateDescription = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="card-body p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-xl mb-2 text-base-content">
              {lesson.name}
            </h3>
            <p className="text-base-content/70 mb-3 leading-relaxed">
              {truncateDescription(lesson.description)}
            </p>
            <div className="flex items-center gap-4 text-sm text-base-content/60">
              <div className="flex items-center gap-1">
                <Icon icon="heroicons:calendar-days" className="size-4" />
                {formatDateTime()}
              </div>
              <div className="flex items-center gap-1">
                <Icon icon="heroicons:clock" className="size-4" />
                {lesson.duration} min
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            className="btn btn-primary btn-sm flex-1"
            onClick={handleStartLesson}
          >
            <Icon icon="heroicons:play" className="size-4" />
            Start Lesson
          </button>
          <button
            className="btn btn-outline btn-sm"
            onClick={handleCopyLink}
            title="Copy lesson link"
          >
            <Icon icon="heroicons:link" className="size-4" />
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => onLessonClick(lesson)}
            title="View lesson details"
          >
            <Icon icon="heroicons:eye" className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Lesson List Component
function LessonList({
  lessons,
  onLessonClick,
  onStartLesson,
}: {
  lessons: Lesson[];
  onLessonClick: (lesson: Lesson) => void;
  onStartLesson?: (lesson: Lesson) => void;
}) {
  const sortedLessons = [...lessons].sort((a, b) => {
    // Sort by scheduled date first
    if (a.scheduledDate && b.scheduledDate) {
      const dateCompare =
        new Date(a.scheduledDate).getTime() -
        new Date(b.scheduledDate).getTime();
      if (dateCompare !== 0) return dateCompare;
    }

    // Then by scheduled time
    if (a.scheduledTime && b.scheduledTime) {
      return a.scheduledTime.localeCompare(b.scheduledTime);
    }

    // Finally by creation date
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="space-y-4">
      {sortedLessons.length === 0 ? (
        <div className="text-center py-12 text-base-content/60">
          <Icon
            icon="heroicons:document-text"
            className="size-12 mx-auto mb-4 opacity-50"
          />
          <p className="text-lg">No lessons available</p>
          <p className="text-sm">Create your first lesson to get started</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-base-content">
              Your Lessons ({sortedLessons.length})
            </h2>
          </div>

          {sortedLessons.map((lesson) => (
            <LessonListItem
              key={lesson.id}
              lesson={lesson}
              onLessonClick={onLessonClick}
              onStartLesson={onStartLesson}
            />
          ))}
        </>
      )}
    </div>
  );
}

export function CalendarView({
  lessons,
  onLessonClick,
  onDateClick,
  onStartLesson,
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateClick(date);
  };

  const handleMonthChange = (date: Date) => {
    setCurrentMonth(date);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Mini Calendar - Small sidebar */}
      <div className="lg:col-span-1">
        <MiniCalendar
          currentMonth={currentMonth}
          selectedDate={selectedDate}
          lessons={lessons}
          onDateClick={handleDateClick}
          onMonthChange={handleMonthChange}
        />
      </div>

      {/* Lesson List - Large main area */}
      <div className="lg:col-span-3">
        <LessonList
          lessons={lessons}
          onLessonClick={onLessonClick}
          onStartLesson={onStartLesson}
        />
      </div>
    </div>
  );
}
