import { auth } from "@/utils/auth";
import Elysia from "elysia";

export const betterAuth = new Elysia({ name: "better-auth" }).macro({
  auth: {
    async resolve({ status, request: r }) {
      const session = await auth.api.getSession({
        headers: r.headers,
      });

      if (!session) {
        console.log("No session found, available cookies:");
        return status(401);
      }

      return {
        user: session.user,
        session: session.session,
      };
    },
  },
});
