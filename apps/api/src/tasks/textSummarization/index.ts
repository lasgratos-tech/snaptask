import { textSummarizationInputSchema } from "./schema.js";
import { priceTextSummarization } from "./pricing.js";
import { executeTextSummarization } from "./handler.js";

export const TEXT_SUMMARIZATION_TASK = {
  taskCode: "TEXT_SUMMARIZATION",
  version: "v1",
  inputSchema: textSummarizationInputSchema,
  pricing: priceTextSummarization,
  execute: executeTextSummarization,
};
