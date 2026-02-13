import OpenAI from 'openai';

let client: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  if (!client) {
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  return client;
}

export async function runOpenAITask(
  taskType: string,
  input: string
): Promise<{ output: string; tokensUsed?: number }> {
  /**
   * 🧠 TEXT SUMMARIZE
   */
  if (taskType === 'text_summarize') {
    const openai = getOpenAIClient();

    const response = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        { role: 'system', content: 'You summarize text clearly and concisely.' },
        { role: 'user', content: input },
      ],
    });

    return {
      output: response.choices[0]?.message?.content ?? '',
      tokensUsed: response.usage?.total_tokens,
    };
  }

  /**
   * 🖼️ IMAGE GENERATE (STUB MVP)
   * Remplacé plus tard par OpenAI Images API
   */
  if (taskType === 'image_generate') {
    return {
      output: `IMAGE_GENERATION_STUB: "${input}"`,
      tokensUsed: 0,
    };
  }

  throw new Error(`Unsupported taskType: ${taskType}`);
}

export async function runOpenAICvInstant(params: {
  imageUrl: string
  targetRole: string
  language: 'fr' | 'en'
  style: 'classic' | 'modern' | 'executive'
  includeCoverLetter: boolean
}): Promise<{
  output: string
  usage: { promptTokens?: number; completionTokens?: number; totalTokens?: number }
}> {
  const openai = getOpenAIClient()
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'You are an expert HR assistant. Analyze the image, extract structured profile data, normalize standard CV sections, then generate a professional CV and an optional cover letter. Return ONLY valid JSON with the exact schema requested, no extra text.',
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Target role: ${params.targetRole}
Language: ${params.language}
Style: ${params.style}
Include cover letter: ${params.includeCoverLetter ? 'yes' : 'no'}

Return JSON with:
{
  "cv": { "content": "string", "sections": [{ "title": "string", "content": "string" }] },
  "coverLetter": "string | null",
  "confidenceScore": 0.0
}`,
          },
          {
            type: 'image_url',
            image_url: {
              url: params.imageUrl,
            },
          },
        ],
      },
    ],
  })

  return {
    output: response.choices[0]?.message?.content ?? '',
    usage: {
      promptTokens: response.usage?.prompt_tokens,
      completionTokens: response.usage?.completion_tokens,
      totalTokens: response.usage?.total_tokens,
    },
  }
}

export async function runOpenAICvInstantTextOnly(params: {
  targetRole: string
  language: 'fr' | 'en'
  style: 'classic' | 'modern' | 'executive'
  includeCoverLetter: boolean
}): Promise<{
  output: string
  usage: { promptTokens?: number; completionTokens?: number; totalTokens?: number }
}> {
  const openai = getOpenAIClient()
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'You are an expert HR assistant. Generate a professional CV and an optional cover letter from provided textual context. Return ONLY valid JSON with the exact schema requested, no extra text.',
      },
      {
        role: 'user',
        content: `Target role: ${params.targetRole}
Language: ${params.language}
Style: ${params.style}
Include cover letter: ${params.includeCoverLetter ? 'yes' : 'no'}

No image was provided. Generate a structured CV and cover letter based on typical professional profiles for the target role.

Return JSON with:
{
  "cv": { "content": "string", "sections": [{ "title": "string", "content": "string" }] },
  "coverLetter": "string | null",
  "confidenceScore": 0.0
}`,
      },
    ],
  })

  return {
    output: response.choices[0]?.message?.content ?? '',
    usage: {
      promptTokens: response.usage?.prompt_tokens,
      completionTokens: response.usage?.completion_tokens,
      totalTokens: response.usage?.total_tokens,
    },
  }
}

export async function runOpenAICvProfessional(params: {
  profileText: string
  targetRole: string
  language: 'fr' | 'en'
}): Promise<{
  output: string
  usage?: { promptTokens?: number; completionTokens?: number; totalTokens?: number }
}> {
  const openai = getOpenAIClient()

  const systemPrompt =
    params.language === 'en'
      ? 'You are an expert HR specialist. You write clear, concise, and professional resumes (CVs) for job applications.'
      : "Tu es un expert RH. Tu rédiges des CV professionnels, clairs et structurés pour des candidatures à un poste."

  const response = await openai.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: `
Target role / Poste ciblé: ${params.targetRole}
Language / Langue: ${params.language}

Profile / Contexte candidat:
${params.profileText}

Constraints:
- Return a single professional CV in plain text.
- Use clear section titles (e.g. Summary, Experience, Education, Skills).
- Adapt tone and content to the target role.
- Do NOT include explanations about what you are doing.
- Do NOT wrap the content in JSON, markdown or code fences.
        `.trim(),
      },
    ],
  })

  return {
    output: response.choices[0]?.message?.content ?? '',
    usage: {
      promptTokens: response.usage?.prompt_tokens,
      completionTokens: response.usage?.completion_tokens,
      totalTokens: response.usage?.total_tokens,
    },
  }
}

