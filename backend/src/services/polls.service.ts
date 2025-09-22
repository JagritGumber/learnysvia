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
