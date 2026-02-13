import { z } from 'zod'
import {
  runOpenAICvInstant,
  runOpenAICvInstantTextOnly,
} from '../../providers/openai/openai.client.js'

const cvInstantOutputSchema = z.object({
  cv: z.object({
    content: z.string(),
    sections: z.array(
      z.object({
        title: z.string(),
        content: z.string(),
      }),
    ),
  }),
  coverLetter: z.string().nullable(),
  confidenceScore: z.number().min(0).max(1),
})

const pricingConfig = {
  inputUsdPerMillion: 0.15,
  outputUsdPerMillion: 0.6,
  currency: 'USD',
  provider: 'openai',
}

function isBase64(value: string) {
  const normalized = value.replace(/\s+/g, '')
  if (!normalized || normalized.length % 4 !== 0) {
    return false
  }
  return /^[A-Za-z0-9+/=]+$/.test(normalized)
}

function normalizeImageInput(image: string) {
  const trimmed = image.trim()
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    throw new Error('IMAGE_URL_NOT_ALLOWED')
  }

  if (trimmed.startsWith('data:')) {
    const match = trimmed.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/)
    if (!match || !isBase64(match[2])) {
      throw new Error('INVALID_IMAGE_BASE64')
    }
    return trimmed
  }

  if (!isBase64(trimmed)) {
    throw new Error('INVALID_IMAGE_BASE64')
  }

  return `data:image/jpeg;base64,${trimmed}`
}

function extractJson(text: string) {
  const trimmed = text.trim()
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    return trimmed
  }
  const firstBrace = trimmed.indexOf('{')
  const lastBrace = trimmed.lastIndexOf('}')
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error('INVALID_MODEL_JSON')
  }
  return trimmed.slice(firstBrace, lastBrace + 1)
}

function computeCostUsd(usage: {
  promptTokens?: number
  completionTokens?: number
  totalTokens?: number
}) {
  const promptTokens = usage.promptTokens ?? 0
  const completionTokens = usage.completionTokens ?? 0
  const totalTokens = usage.totalTokens ?? promptTokens + completionTokens
  const billedPrompt = promptTokens > 0 ? promptTokens : totalTokens
  const billedCompletion = completionTokens > 0 ? completionTokens : 0

  const inputCost =
    (billedPrompt / 1_000_000) * pricingConfig.inputUsdPerMillion
  const outputCost =
    (billedCompletion / 1_000_000) * pricingConfig.outputUsdPerMillion

  return inputCost + outputCost
}

export async function runCvInstant(params: {
  image?: string | null
  targetRole: string
  language: 'fr' | 'en'
  style: 'classic' | 'modern' | 'executive'
  includeCoverLetter: boolean
}) {
  const result = params.image
    ? await runOpenAICvInstant({
        imageUrl: normalizeImageInput(params.image),
        targetRole: params.targetRole,
        language: params.language,
        style: params.style,
        includeCoverLetter: params.includeCoverLetter,
      })
    : await runOpenAICvInstantTextOnly({
        targetRole: params.targetRole,
        language: params.language,
        style: params.style,
        includeCoverLetter: params.includeCoverLetter,
      })

  const parsed = cvInstantOutputSchema.parse(
    JSON.parse(extractJson(result.output)),
  )

  const costUsd = computeCostUsd({
    promptTokens: result.usage.promptTokens,
    completionTokens: result.usage.completionTokens,
    totalTokens: result.usage.totalTokens,
  })

  return {
    cv: parsed.cv,
    coverLetter: parsed.coverLetter,
    confidenceScore: parsed.confidenceScore,
    tokens: result.usage.totalTokens ?? 0,
    cost: Number(costUsd.toFixed(6)),
    currency: pricingConfig.currency,
    provider: pricingConfig.provider,
  }
}
