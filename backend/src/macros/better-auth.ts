import { auth } from "@/utils/auth";
import { stripPrefixFromCookie } from "@/utils/stripPrefix";
import Elysia from "elysia";

export const betterAuth = new Elysia({ name: "better-auth" }).macro({
  auth: {
    async resolve({ status, request: r }) {
      const cookieHeader = r.headers.get("cookie");
      let newReq = r;
      if (cookieHeader) {
        const rewrittenCookie = stripPrefixFromCookie(cookieHeader);
        if (rewrittenCookie !== cookieHeader) {
          // clone the request with new headers
          const newHeaders = new Headers(r.headers);
          newHeaders.set("cookie", rewrittenCookie);

          newReq = new Request(r.url, {
            method: r.method,
            headers: newHeaders,
            body: r.body, // works for most requests; for streams you may need r.clone()
            redirect: r.redirect,
          });

          console.log("[cookieRewrite] Rewrote cookie:", rewrittenCookie);
        }
      }

      const session = await auth.api.getSession({
        headers: newReq.headers,
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
