import { db } from "@/database/db";
import * as t from "@/database/schemas";
import * as q from "drizzle-orm";

export const getRoomPolls = async (rid: string) => {
  return await db.select().from(t.poll).where(q.eq(t.poll.roomId, rid));
};
