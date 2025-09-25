import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../database/db";
import * as schema from "../database/schemas";
import { anonymous } from "better-auth/plugins";
import { env } from "@/env";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: [env.CLIENT_URL],
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  plugins: [
    anonymous({
      emailDomainName: env.CLIENT_URL.replace(/(https|http):\/\//g, ""),
    }),
  ],
  advanced: {
    useSecureCookies: true,
  },
});
