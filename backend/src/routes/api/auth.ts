import { auth } from "@/utils/auth";
import { stripPrefixFromCookie } from "@/utils/stripPrefix";
import Elysia from "elysia";

export const authRouter = new Elysia({ prefix: "/auth" })
  .get("/get-session", async ({ request, set }) => {
    const cookieHeader = request.headers.get("cookie");
    let newReq = request;

    if (cookieHeader) {
      const rewrittenCookie = stripPrefixFromCookie(cookieHeader);
      if (rewrittenCookie !== cookieHeader) {
        // clone the request with new headers
        const newHeaders = new Headers(request.headers);
        newHeaders.set("cookie", rewrittenCookie);

        newReq = new Request(request.url, {
          method: request.method,
          headers: newHeaders,
          body: request.body,
          redirect: request.redirect,
        });

        console.log("[cookieRewrite] Rewrote cookie:", rewrittenCookie);
      }
    }

    try {
      const session = await auth.api.getSession({
        headers: newReq.headers,
      });

      if (!session) {
        console.log("No session found, available cookies:", cookieHeader);
        set.status = 401;
        return {
          error: "No session found",
          user: null,
          session: null
        };
      }

      return {
        user: session.user,
        session: session.session,
      };
    } catch (error) {
      console.error("Error getting session:", error);
      set.status = 500;
      return {
        error: "Internal server error",
        user: null,
        session: null
      };
    }
  });
