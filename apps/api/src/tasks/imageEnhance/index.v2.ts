import { z } from 'zod'
import type { TaskDefinition } from '../../modules/tasks/task.registry.v2.js'

// 1️⃣ Schema V2
const imageEnhanceInputSchema = z.object({
  imageUrl: z.string().url(),
  operation: z.enum(['UPSCALE', 'DENOISE', 'SHARPEN']),
  outputFormat: z.enum(['PNG', 'JPG']).optional().default('PNG'),
})

// 2️⃣ TaskDefinition V2
export const IMAGE_ENHANCE_V2: TaskDefinition = {
  code: 'IMAGE_ENHANCE',
  version: 1,

  inputSchema: imageEnhanceInputSchema,

  pricing: {
    amountCents: 25,
    currency: 'EUR',
  },

  async run(input: unknown) {
    const payload = input as {
      imageUrl: string
      operation: string
      outputFormat?: string
    }

    // ⚠️ MOCK déterministe V1
    return {
      outputImageUrl: payload.imageUrl,
      operation: payload.operation,
      outputFormat: payload.outputFormat ?? 'PNG',
      model: 'image-enhance-mock-v1',
    }
  },
}
