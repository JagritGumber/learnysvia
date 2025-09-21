import { getUserCatalog } from "@/services/catalogs.service";
import Elysia from "elysia";
import z from "zod";
import { betterAuth } from "./better-auth";

export const catalogMacro = new Elysia({ name: "catalogs.macro" })
  .use(betterAuth)
  .guard({
    params: z.object({
      cid: z.string(),
    }),
    auth: true,
  })
  .macro({
    catalog: {
      async resolve({ params, user, status }) {
        const { cid } = params;

        const catalog = await getUserCatalog(cid, {
          userId: user!.id,
        });

        if (!catalog) {
          return status(404, "No catalog found");
        }

        return {
          catalog,
        };
      },
    },
  });
