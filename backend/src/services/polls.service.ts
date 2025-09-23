import { db } from "@/database/db";
import * as t from "@/database/schemas";
import type { PollResults } from "@/shared/types/poll";
import * as q from "drizzle-orm";

export const getRoomPolls = async (rid: string) => {
  const polls = await db.query.poll.findMany({
    where: q.eq(t.poll.roomId, rid),
    with: {
      question: {
        with: {
          options: true,
        },
      },
    },
  });

  const mappedPolls: t.SelectPoll[] = [];

  for (const poll of polls) {
    const mappedPoll = {
      ...poll,
      finalResults: JSON.parse(
        poll.finalResults as unknown as string
      ) as PollResults[],
    };
    mappedPolls.push(mappedPoll);
  }

  return mappedPolls;
};

export const createRoomPoll = async (
  rid: string,
  {
    questionId,
    timeLimit,
  }: {
    questionId: string;
    timeLimit?: number;
  }
) => {
  const timeLimitMinutes = timeLimit ?? 1;
  const expiresAt = new Date(Date.now() + timeLimitMinutes * 60_000);

  // Get current participant count (excluding hosts) for consistent statistics
  const participants = await db.query.roomParticipant.findMany({
    where: q.eq(t.roomParticipant.roomId, rid),
  });

  const participantsWhoNeedToAnswer = participants.filter(
    (p) => p.role !== "host"
  );
  const totalParticipantsAtCreation = participantsWhoNeedToAnswer.length;

  const poll = await db
    .insert(t.poll)
    .values({
      questionId,
      roomId: rid,
      timeLimit: timeLimit || 1,
      expiresAt,
      totalParticipantsAtCreation,
    })
    .returning()
    .get();

  const { app } = await import("../index.js");
  app.server?.publish(`room_${rid}`, "poll:created");

  return poll;
};

export const getRoomPollById = async (rid: string, pid: string) => {
  const poll = await db.query.poll.findFirst({
    where: q.and(q.eq(t.poll.roomId, rid), q.eq(t.poll.id, pid)),
    with: {
      question: {
        with: {
          options: true,
        },
      },
    },
  });

  if (!poll) return null;

  const mappedPoll = {
    ...poll,
    finalResults: JSON.parse(
      poll.finalResults as unknown as string
    ) as PollResults[],
  };

  return mappedPoll as t.SelectPoll;
};

export const submitPollAnswer = async (
  pid: string,
  uid: string,
  oid: string
) => {
  // Check if user already answered this poll
  const existingAnswer = await db.query.pollAnswer.findFirst({
    where: q.and(
      q.eq(t.pollAnswer.pollId, pid),
      q.eq(t.pollAnswer.userId, uid)
    ),
  });

  if (existingAnswer) {
    throw new Error("User has already answered this poll");
  }

  const answer = await db
    .insert(t.pollAnswer)
    .values({
      pollId: pid,
      userId: uid,
      optionId: oid,
      status: "answered",
    })
    .returning()
    .get();

  // Check if poll should be completed after this answer
  await checkAndCompletePoll(pid);

  return answer;
};

export const getPollAnswers = async (pid: string) => {
  const answers = await db.query.pollAnswer.findMany({
    where: q.eq(t.pollAnswer.pollId, pid),
    with: {
      user: true,
      poll: {
        with: {
          question: {
            with: {
              options: true,
            },
          },
        },
      },
    },
  });
  return answers;
};

export const hasUserAnsweredPoll = async (pid: string, uid: string) => {
  const answer = await db.query.pollAnswer.findFirst({
    where: q.and(
      q.eq(t.pollAnswer.pollId, pid),
      q.eq(t.pollAnswer.userId, uid)
    ),
  });
  return !!answer;
};

export const skipRoomPoll = async (rid: string, pid: string, uid: string) => {
  // First check if the poll exists and belongs to the room
  const poll = await db.query.poll.findFirst({
    where: q.and(q.eq(t.poll.roomId, rid), q.eq(t.poll.id, pid)),
  });

  if (!poll) {
    throw new Error("Poll not found or doesn't belong to this room");
  }

  // Check if user already has an answer for this poll
  const existingAnswer = await db.query.pollAnswer.findFirst({
    where: q.and(
      q.eq(t.pollAnswer.pollId, pid),
      q.eq(t.pollAnswer.userId, uid)
    ),
  });

  if (!existingAnswer) {
    // Create a skipped poll answer record for this specific user
    await db.insert(t.pollAnswer).values({
      pollId: pid,
      userId: uid,
      status: "skipped",
    });
  }

  return poll;
};

export const deleteRoomPoll = async (rid: string, pid: string) => {
  // First check if the poll exists and belongs to the room
  const poll = await db.query.poll.findFirst({
    where: q.and(q.eq(t.poll.roomId, rid), q.eq(t.poll.id, pid)),
  });

  if (!poll) {
    throw new Error("Poll not found or doesn't belong to this room");
  }

  // Delete poll answers first (due to foreign key constraints)
  await db.delete(t.pollAnswer).where(q.eq(t.pollAnswer.pollId, pid));

  // Delete the poll
  const deletedPoll = await db
    .delete(t.poll)
    .where(q.and(q.eq(t.poll.roomId, rid), q.eq(t.poll.id, pid)))
    .returning()
    .get();

  return deletedPoll;
};

export const getNewlyCreatedPoll = async (rid: string) => {
  const now = new Date();

  const poll = await db.query.poll.findFirst({
    where: q.and(q.eq(t.poll.roomId, rid), q.gt(t.poll.expiresAt, now)),
    orderBy: [q.desc(t.poll.createdAt)],
    with: {
      question: {
        with: {
          options: true,
        },
      },
    },
  });

  return poll ?? null;
};

// Calculate and store final poll results
export const calculateAndStorePollResults = async (pid: string) => {
  const poll = await db.query.poll.findFirst({
    where: q.eq(t.poll.id, pid),
    with: {
      question: {
        with: {
          options: true,
        },
      },
    },
  });

  if (!poll) {
    throw new Error("Poll not found");
  }

  // Get all answers for this poll
  const answers = await db.query.pollAnswer.findMany({
    where: q.eq(t.pollAnswer.pollId, pid),
  });

  // Calculate results for each option
  const results = poll.question.options.map((option) => {
    const optionAnswers = answers.filter(
      (answer) => answer.optionId === option.id
    );
    const count = optionAnswers.length;
    const percentage =
      poll.totalParticipantsAtCreation > 0
        ? (count / poll.totalParticipantsAtCreation) * 100
        : 0;

    return {
      optionId: option.id,
      optionText: option.text,
      count,
      percentage: Math.round(percentage * 100) / 100, // Round to 2 decimal places
      isCorrect: option.isCorrect,
    };
  });

  // Store the results and mark poll as completed
  await db
    .update(t.poll)
    .set({
      finalResults: results,
      isCompleted: true,
    })
    .where(q.eq(t.poll.id, pid));

  return results;
};

// Check if poll should be completed and calculate results
export const checkAndCompletePoll = async (pid: string) => {
  const poll = await db.query.poll.findFirst({
    where: q.eq(t.poll.id, pid),
  });

  if (!poll || poll.isCompleted) {
    return null;
  }

  const answers = await db.query.pollAnswer.findMany({
    where: q.eq(t.pollAnswer.pollId, pid),
  });

  // Complete poll if all participants have answered or poll has expired
  const shouldComplete =
    answers.length >= poll.totalParticipantsAtCreation ||
    new Date() > new Date(poll.expiresAt);

  if (shouldComplete) {
    return await calculateAndStorePollResults(pid);
  }

  return null;
};
