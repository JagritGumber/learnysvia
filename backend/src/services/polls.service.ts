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
  }: {
    questionId: string;
  }
) => {
  return await db
    .insert(t.poll)
    .values({
      questionId,
      roomId: rid,
    })
    .returning()
    .get();
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

export const submitPollAnswer = async (
  pid: string,
  uid: string,
) => {
  // Check if user already answered this poll
  const existingAnswer = await db.query.pollAnswer.findFirst({
    where: q.and(q.eq(t.pollAnswer.pollId, pid), q.eq(t.pollAnswer.userId, uid)),
  });

  if (existingAnswer) {
    throw new Error("User has already answered this poll");
  }

  return await db
    .insert(t.pollAnswer)
    .values({
      pollId: pid,
      userId: uid,
    })
    .returning()
    .get();
};

export const getPollAnswers = async (pid: string) => {
  return await db.query.pollAnswer.findMany({
    where: q.eq(t.pollAnswer.pollId, pid),
    with: {
      user: true,
    },
  });
};

export const hasUserAnsweredPoll = async (pid: string, uid: string) => {
  const answer = await db.query.pollAnswer.findFirst({
    where: q.and(q.eq(t.pollAnswer.pollId, pid), q.eq(t.pollAnswer.userId, uid)),
  });
  return !!answer;
};
