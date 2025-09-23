import { db } from "@/database/db";
import * as t from "@/database/schemas";
import * as q from "drizzle-orm";

export const getRoomPolls = async (rid: string) => {
  return await db.query.poll.findMany({
    where: q.eq(t.poll.roomId, rid),
    with: {
      question: {
        with: {
          options: true,
        },
      },
    },
  });
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

  const poll = await db
    .insert(t.poll)
    .values({
      questionId,
      roomId: rid,
      timeLimit: timeLimit || 1,
      expiresAt,
    })
    .returning()
    .get();

  const { app } = await import("../index.js");
  app.server?.publish(`room_${rid}`, "poll:created");

  return poll;
};

export const getRoomPollById = async (rid: string, pid: string) => {
  return await db.query.poll.findFirst({
    where: q.and(q.eq(t.poll.roomId, rid), q.eq(t.poll.id, pid)),
    with: {
      question: {
        with: {
          options: true,
        },
      },
    },
  });
};

export const submitPollAnswer = async (pid: string, uid: string, oid: string) => {
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

  return await db
    .insert(t.pollAnswer)
    .values({
      pollId: pid,
      userId: uid,
      optionId: oid,
    })
    .returning()
    .get();
};

export const getPollAnswers = async (pid: string) => {
  return await db.query.pollAnswer.findMany({
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
