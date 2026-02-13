import type { TextSummarizationInput } from "./schema.js";

type ExecutionContext = {
  taskExecutionId: string;
};

export async function executeTextSummarization(
  input: TextSummarizationInput,
  _context: ExecutionContext
) {
  // ⚠️ AUCUN accès DB
  // ⚠️ AUCUNE idempotencyKey
  // ⚠️ AUCUN retry ici

  const summary = input.text.slice(0, input.maxLength);

  return {
    summary,
    tokensUsed: input.text.length,
    model: "baseline-summarizer-v1",
  };
}
