import { imageEnhanceInputSchema } from "./schema.js";
import { IMAGE_ENHANCE_PRICING } from "./pricing.js";
import { executeImageEnhance } from "./handler.js";

export const IMAGE_ENHANCE_TASK = {
  taskCode: "IMAGE_ENHANCE",
  version: "v1",
  inputSchema: imageEnhanceInputSchema,
  pricing: IMAGE_ENHANCE_PRICING,
  execute: executeImageEnhance,
};
