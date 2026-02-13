import { z } from 'zod'
import type { TaskDefinition } from '../../modules/tasks/task.registry.v2.js'

// 1️⃣ Schema V2
const imageProductPhotoInputSchema = z.object({
  imageUrl: z.string().url(),
  background: z.enum(['WHITE', 'LIFESTYLE']).default('WHITE'),
  outputFormat: z.enum(['PNG', 'JPG']).default('PNG'),
  size: z.enum(['1024', '2048']).default('1024'),
})

// 2️⃣ TaskDefinition V2
export const IMAGE_PRODUCT_PHOTO_V2: TaskDefinition = {
  code: 'IMAGE_PRODUCT_PHOTO',
  version: 1,

  inputSchema: imageProductPhotoInputSchema,

  pricing: {
    amountCents: 125, // 1,25 €
    currency: 'EUR',
  },

  async run(input: unknown) {
    const payload = input as {
      imageUrl: string
      background: 'WHITE' | 'LIFESTYLE'
      outputFormat: 'PNG' | 'JPG'
      size: '1024' | '2048'
    }

    // ⚠️ MOCK déterministe V1 (aucun appel externe)
    return {
      outputImageUrl: payload.imageUrl,
      background: payload.background,
      size: Number(payload.size),
      outputFormat: payload.outputFormat,
      model: 'product-photo-mock-v1',
    }
  },
}
