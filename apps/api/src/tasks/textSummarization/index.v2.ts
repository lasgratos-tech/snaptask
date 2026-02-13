import { z } from 'zod'
import type { TaskDefinition } from '../../modules/tasks/task.registry.v2.js'
import { runOpenAITask } from '../../providers/openai/openai.client.js'

/**
 * =========================
 * RUNTIME HANDLER (API ROUTE)
 * =========================
 */
export async function runTextSummarizationV2(params: {
  text: string
  style: string
  language: string
  actor: any
}): Promise<{
  summary: string
  usage: { tokens: number }
  cost: number
}> {
  const { text, style, language } = params

  const input = `
Language: ${language}
Style: ${style}

Text:
${text}
`.trim()

  const result = await runOpenAITask('text_summarize', input)

  return {
    summary: result.output,
    usage: {
      tokens: result.tokensUsed ?? 0,
    },
    cost: 0, // billing branché plus tard
  }
}

/**
 * =========================
 * TASK ENGINE DEFINITION
 * =========================
 */
const textProcessInputSchema = z.object({
  text: z.string(),
})

export const TEXT_PROCESS_V2: TaskDefinition = {
  code: 'TEXT_PROCESS',
  version: 1,

  inputSchema: textProcessInputSchema,

  pricing: {
    amountCents: 10,
    currency: 'EUR',
  },

  async run(input: unknown) {
    const payload = textProcessInputSchema.parse(input)

    return {
      original: payload.text,
      processed: payload.text.toUpperCase(),
      length: payload.text.length,
    }
  },
}
