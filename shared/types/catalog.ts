import { createCatalogSchema } from "../../backend/src/database/schemas";
import { z } from "zod";

export type CreateCatalog = Pick<
  z.infer<typeof createCatalogSchema>,
  "name" | "description"
>;
