import type { ImageEnhanceInput } from "./schema.js";

type ExecutionContext = {
  taskExecutionId: string;
};

export async function executeImageEnhance(
  input: ImageEnhanceInput,
  _context: ExecutionContext
) {
  // ⚠️ AUCUN accès DB
  // ⚠️ AUCUNE idempotencyKey
  // ⚠️ AUCUN retry ici
  // ⚠️ PAS d'appel IA réel en V1 (mock contrôlé)

  return {
    outputImageUrl: input.imageUrl,
    operation: input.operation,
    outputFormat: input.outputFormat,
    model: "image-enhance-mock-v1",
  };
}
