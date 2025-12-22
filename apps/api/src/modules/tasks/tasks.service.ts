import type { ExecuteTaskDTO, TaskExecutionResult } from './tasks.types';
import { runOpenAITask } from '../../providers/openai/openai.client';

export async function executeTask(
  dto: ExecuteTaskDTO
): Promise<TaskExecutionResult> {
  const result = await runOpenAITask(dto.taskType, dto.input);

  return {
    taskType: dto.taskType,
    output: result.output,
    tokensUsed: result.tokensUsed,
    provider: 'openai',
  };
}
