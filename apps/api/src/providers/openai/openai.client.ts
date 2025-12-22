import OpenAI from 'openai';

let client: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
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
      output: response.choices[0].message.content ?? '',
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
