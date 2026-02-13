import { runOpenAITask } from '../../providers/openai/openai.client.js'

export async function executeTask(
  dto: { taskCode: string; input: unknown }
): Promise<unknown> {
  const result = await runOpenAITask(dto.taskCode, dto.input as string)

  return {
    taskCode: dto.taskCode,
    output: result.output,
    tokensUsed: result.tokensUsed,
    provider: 'openai',
  }
}
