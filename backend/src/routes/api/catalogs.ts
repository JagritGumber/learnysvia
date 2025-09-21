import { createCatalogSchema, updateCatalogSchema } from "@/database/schemas";
import { betterAuth } from "@/macros/better-auth";
import {
  createEmptyCatalog,
  deleteCatalog,
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
  .get("/", async ({ user }) => {
    const userCatalogs = await getUserCatalogs(user.id);
    return {
      catalogs: userCatalogs,
    };
  })
  .post(
    "/",
    async ({ body, user }) => {
      const { name, description } = body;

      const newCatalog = await createEmptyCatalog({
        name,
        description,
        userId: user.id,
      });

      return {
        catalog: newCatalog,
      };
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
        .patch(
          "/",
          async ({ params, body, user }) => {
            const { cid } = params;
            const { name, description } = body;

            const updatedCatalog = await updateCatalog(cid, {
              name,
              description,
              userId: user.id,
            });

            return {
              catalog: updatedCatalog,
            };
          },
          {
            body: "updateCatalog",
          }
        )
        .delete("/", async ({ params, user }) => {
          const { cid } = params;

          const deletedCatalog = deleteCatalog({
            userId: user.id,
            catalogId: cid,
          });

          return {
            catalog: deletedCatalog,
          };
        })
        .use(questionsRouter)
  );
