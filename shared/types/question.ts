import { selectQuestionSchema } from "../../backend/src/database/schemas";
import { z } from "zod";

export type SelectQuestion = z.infer<typeof selectQuestionSchema>;
