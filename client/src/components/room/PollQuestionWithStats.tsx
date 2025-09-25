import { usePollAnswers } from "@/queries/pollAnswers.query";
import { SelectPollWithQuestionAndOptions } from "@/shared/types/poll";
import { usePollManagement } from "@/hooks/usePollManagement";
import { Icon } from "@iconify/react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

interface PollQuestionWithStatsProps {
  poll: SelectPollWithQuestionAndOptions;
  roomId: string;
}

export function PollQuestionWithStats({
  poll,
  roomId,
}: PollQuestionWithStatsProps) {
  // Get poll answers to calculate statistics
  const { data: pollAnswers } = usePollAnswers(roomId, poll.id);

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82CA9D",
  ];

  // Get poll management functions for delete functionality
  const { handleDeletePoll, canDeletePoll, isDeletingPoll } = usePollManagement(
    {
      roomId,
    }
  );

  const totalParticipants = poll.totalParticipantsAtCreation || 0;
  const answeredCount =
    pollAnswers?.filter((answer) => answer.optionId !== null)?.length || 0;

  // Count actual answered vs skipped
  // const answeredWithOption = pollAnswers?.filter((answer) => answer.optionId !== null).length || 0;
  const skippedCount =
    pollAnswers?.filter((answer) => answer.status === "skipped").length || 0;

  // Prepare chart data including skipped answers
  const chartData =
    poll.question?.options?.map((option, index) => {
      const answerCount =
        pollAnswers?.filter((answer) => answer.optionId === option.id).length ||
        0;
      const percentage =
        totalParticipants > 0 ? (answerCount / totalParticipants) * 100 : 0;

      return {
        name: option.text,
        value: answerCount,
        percentage: percentage.toFixed(0),
        color: COLORS[index % COLORS.length], // Use predefined colors
        isCorrect: option.isCorrect,
      };
    }) || [];

  // Add skipped answers to chart data if any exist
  if (skippedCount > 0) {
    chartData.push({
      name: "Skipped",
      value: skippedCount,
      percentage: ((skippedCount / totalParticipants) * 100).toFixed(0),
      color: "#94A3B8", // Gray color for skipped
      isCorrect: false,
    });
  }

  // Custom legend component
  const CustomLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-base-content font-medium">
              {entry.payload?.name === "Skipped"
                ? "Skipped"
                : String.fromCharCode(65 + index)}
              {entry.payload?.isCorrect &&
                entry.payload?.name !== "Skipped" && (
                  <span className="ml-1 text-success">✓</span>
                )}
            </span>
            <span className="text-xs text-base-content/60">
              ({entry.payload?.percentage}%)
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-8 w-full bg-gradient-to-br from-base-100 to-base-200 h-full">
      {/* Header with delete button */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex-1">
          <label className="block text-sm font-medium text-base-content mb-3">
            Question
          </label>
          <div className="bg-base-200 rounded-lg p-6 border border-base-300 w-full">
            <p className="text-base-content text-xl font-semibold">
              {poll.question?.text || "No question text"}
            </p>
          </div>
        </div>
        {canDeletePoll && (
          <button
            className={`btn btn-ghost btn-sm btn-circle ml-4 ${isDeletingPoll ? "loading" : ""}`}
            onClick={handleDeletePoll}
            title="Delete Poll"
            disabled={isDeletingPoll}
          >
            <Icon icon="lineicons:trash-3" className="size-4" />
          </button>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
          <div className="text-2xl font-bold text-primary">{answeredCount}</div>
          <div className="text-sm text-base-content/70">Answered</div>
        </div>
        <div className="bg-warning/10 rounded-lg p-4 border border-warning/20">
          <div className="text-2xl font-bold text-warning">{skippedCount}</div>
          <div className="text-sm text-base-content/70">Skipped</div>
        </div>
        <div className="bg-info/10 rounded-lg p-4 border border-info/20">
          <div className="text-2xl font-bold text-info">
            {totalParticipants}
          </div>
          <div className="text-sm text-base-content/70">Total Participants</div>
        </div>
      </div>

      {/* Pie Chart Section - Show when poll is expired OR all participants have answered */}
      {(poll.expiresAt.getTime() <= Date.now() || answeredCount === totalParticipants) && (
        <div className="bg-base-100 rounded-lg p-6 border border-base-300 mb-6">
          <h3 className="text-lg font-semibold text-base-content mb-4">
            Results Overview
          </h3>
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-1 w-full lg:w-1/2">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend content={<CustomLegend />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Detailed Stats */}
            <div className="flex-1 w-full lg:w-1/2">
              <div className="space-y-3">
                {poll.question?.options?.map((option, index) => {
                  const answerCount =
                    pollAnswers?.filter(
                      (answer) => answer.optionId === option.id
                    ).length || 0;
                  const percentage =
                    totalParticipants > 0
                      ? (answerCount / totalParticipants) * 100
                      : 0;

                  return (
                    <div
                      key={option.id}
                      className="flex items-center gap-3 p-3 bg-base-200 rounded-lg"
                    >
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                      <span className="text-sm font-medium text-base-content min-w-fit">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <span className="text-base-content flex-1">
                        {option.text}
                      </span>
                      {option.isCorrect && (
                        <div className="badge badge-success badge-sm">
                          Correct
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-base-300 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-base-content min-w-fit">
                          {answerCount} ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
                {skippedCount > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: "#94A3B8" }}
                    />
                    <span className="text-sm font-medium text-base-content">
                      Skipped
                    </span>
                    <div className="flex items-center gap-2 ml-auto">
                      <div className="w-20 bg-base-300 rounded-full h-2">
                        <div
                          className="bg-warning h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${(skippedCount / totalParticipants) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-base-content min-w-fit">
                        {skippedCount} (
                        {((skippedCount / totalParticipants) * 100).toFixed(0)}
                        %)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No answers state - Show when poll is still active AND not all participants have answered */}
      {poll.expiresAt.getTime() >= Date.now() && answeredCount < totalParticipants && (
        <div className="bg-base-100 rounded-lg p-8 border border-base-300 text-center">
          <Icon
            icon="lineicons:chart-pie"
            className="size-16 text-base-content/30 mx-auto mb-4"
          />
          <h3 className="text-lg font-semibold text-base-content mb-2">
            No Responses Yet
          </h3>
          <p className="text-base-content/70">
            Waiting for participants to answer this poll...
          </p>
        </div>
      )}
    </div>
  );
}
