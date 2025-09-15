import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";

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
}

export function CalendarView({ lessons, onLessonClick, onDateClick }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getLessonsForDate = (date: Date) => {
    return lessons.filter(lesson =>
      lesson.scheduledDate && isSameDay(new Date(lesson.scheduledDate), date)
    );
  };

  const previousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body">
        <div className="flex justify-between items-center mb-4">
          <h2 className="card-title">Lesson Calendar</h2>
          <div className="flex gap-2">
            <button className="btn btn-sm btn-ghost" onClick={previousMonth}>
              ‹
            </button>
            <span className="font-semibold">
              {format(currentMonth, "MMMM yyyy")}
            </span>
            <button className="btn btn-sm btn-ghost" onClick={nextMonth}>
              ›
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <div key={day} className="p-2 text-center font-semibold text-sm">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map(day => {
            const dayLessons = getLessonsForDate(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);

            return (
              <div
                key={day.toISOString()}
                className={`min-h-20 p-1 border border-base-200 cursor-pointer hover:bg-base-200 transition-colors ${
                  !isCurrentMonth ? "text-base-content/40" : ""
                }`}
                onClick={() => onDateClick(day)}
              >
                <div className="text-sm font-medium mb-1">
                  {format(day, "d")}
                </div>
                <div className="space-y-1">
                  {dayLessons.slice(0, 2).map(lesson => (
                    <div
                      key={lesson.id}
                      className="text-xs p-1 bg-primary text-primary-content rounded cursor-pointer hover:bg-primary-focus"
                      onClick={(e) => {
                        e.stopPropagation();
                        onLessonClick(lesson);
                      }}
                      title={`${lesson.name} - ${lesson.scheduledTime || "No time set"}`}
                    >
                      <div className="truncate">{lesson.name}</div>
                      {lesson.scheduledTime && (
                        <div className="text-xs opacity-80">{lesson.scheduledTime}</div>
                      )}
                    </div>
                  ))}
                  {dayLessons.length > 2 && (
                    <div className="text-xs text-base-content/60">
                      +{dayLessons.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
