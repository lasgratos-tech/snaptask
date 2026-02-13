import { z } from "zod";

export const imageEnhanceInputSchema = z.object({
  imageUrl: z.string().url(),
  operation: z.enum(["UPSCALE", "DENOISE", "SHARPEN"]),
  outputFormat: z.enum(["PNG", "JPG"]).optional().default("PNG"),
});

export type ImageEnhanceInput = z.infer<
  typeof imageEnhanceInputSchema
>;
