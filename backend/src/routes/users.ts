import { db } from "@/database/db";
import { user } from "@/database/schemas/auth/user";
import Elysia from "elysia";
import { betterAuth } from "@/macros/better-auth";

export const usersRouter = new Elysia({ prefix: "/users" })
  .use(betterAuth)
  .get(
    "/",
    async () => {
      const allUsers = await db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          createdAt: user.createdAt,
        })
        .from(user)
        .orderBy(user.createdAt);

      return {
        success: true,
        users: allUsers,
      };
    },
    { auth: true }
  );
