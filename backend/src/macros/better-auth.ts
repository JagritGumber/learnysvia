import { auth } from "@/utils/auth";
import Elysia from "elysia";

export const betterAuth = new Elysia({ name: "better-auth" }).macro({
  auth: {
    async resolve({ status, request: { headers } }) {
      // Debug: Log cookies to see what's being received
      const cookieHeader = headers.get("cookie");
      if (cookieHeader) {
        console.log("Received cookies:", cookieHeader);
      }

      const session = await auth.api.getSession({
        headers,
      });

      if (!session) {
        console.log("No session found, available cookies:", cookieHeader);
        return status(401);
      }

      return {
        user: session.user,
        session: session.session,
      };
    },
  },
});
