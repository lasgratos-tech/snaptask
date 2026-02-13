import { z } from "zod";

export const textSummarizationInputSchema = z.object({
  text: z.string().min(50),
  maxLength: z.number().int().positive().optional().default(150),
  language: z.enum(["en", "fr"]).optional().default("en"),
});

export type TextSummarizationInput = z.infer<
  typeof textSummarizationInputSchema
>;
