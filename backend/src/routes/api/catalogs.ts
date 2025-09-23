import { createCatalogSchema, updateCatalogSchema } from "@/database/schemas";
import { betterAuth } from "@/macros/better-auth";
import {
  createEmptyCatalog,
  deleteCatalog,
  getUserCatalog,
  getUserCatalogs,
  updateCatalog,
} from "@/services/catalogs.service";
import Elysia from "elysia";
import z from "zod";
import { questionsRouter } from "./catalogs/questions";

export const catalogsRouter = new Elysia({ prefix: "/catalogs" })
  .model({
    createCatalog: createCatalogSchema.pick({
      name: true,
      description: true,
    }),
    updateCatalog: updateCatalogSchema.pick({
      name: true,
      description: true,
    }),
  })
  .use(betterAuth)
  .guard({
    auth: true,
  })
  .get("/", async ({ user, status }) => {
    try {
      const userCatalogs = await getUserCatalogs(user.id);
      return status(200, userCatalogs);
    } catch (e) {
      return status(500);
    }
  })
  .post(
    "/",
    async ({ body, user, status }) => {
      try {
        const { name, description } = body;

        const newCatalog = await createEmptyCatalog({
          name,
          description,
          userId: user.id,
        });

        return status(201, newCatalog);
      } catch (e) {
        return status(500);
      }
    },
    {
      body: "createCatalog",
    }
  )
  .group(
    "/:cid",
    {
      params: z.object({
        cid: z.string(),
      }),
    },
    (app) =>
      app
        .get("/", async ({ params, user, status }) => {
          try {
            const { cid } = params;

            const catalog = await getUserCatalog(cid, { userId: user.id });

            if (!catalog) {
              return status(404, { error: "Catalog not found" });
            }

            return status(200, catalog);
          } catch (e) {
            return status(500);
          }
        })
        .patch(
          "/",
          async ({ params, body, user, status }) => {
            try {
              const { cid } = params;
              const { name, description } = body;

              const updatedCatalog = await updateCatalog(cid, {
                name,
                description,
                userId: user.id,
              });

              return status(200, {
                catalog: updatedCatalog,
              });
            } catch (e) {
              return status(500);
            }
          },
          {
            body: "updateCatalog",
          }
        )
        .delete("/", async ({ params, user, status }) => {
          try {
            const { cid } = params;

            const deletedCatalog = deleteCatalog({
              userId: user.id,
              catalogId: cid,
            });

            return status(200, deletedCatalog);
          } catch (e) {
            return status(500);
          }
        })
        .use(questionsRouter)
  );
