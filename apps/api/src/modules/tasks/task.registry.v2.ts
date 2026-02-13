import type { ZodSchema } from 'zod'
import { TEXT_PROCESS_V2 } from '../../tasks/textSummarization/index.v2.ts'
import { IMAGE_ENHANCE_V2 } from '../../tasks/imageEnhance/index.v2.ts'
import { IMAGE_PRODUCT_PHOTO_V2 } from '../../tasks/imageProductPhoto/index.v2.ts'
export type ExecutionContext = {
  apiKey: string
  userId: string
  taskExecutionId: string
}

export type TaskDefinition = {
  code: string
  version: number
  inputSchema: ZodSchema
  pricing: {
    amountCents: number
    currency: string
  }
  run(input: unknown, ctx: ExecutionContext): Promise<unknown>
}

class TaskRegistryV2 {
  private tasks = new Map<string, TaskDefinition>()

  register(task: TaskDefinition) {
    const key = `${task.code}@${task.version}`
    this.tasks.set(key, task)
  }

  get(code: string, version: number): TaskDefinition | undefined {
    return this.tasks.get(`${code}@${version}`)
  }

  list(): TaskDefinition[] {
    return Array.from(this.tasks.values())
  }
}

export const taskRegistryV2 = new TaskRegistryV2()

taskRegistryV2.register(TEXT_PROCESS_V2)
taskRegistryV2.register(IMAGE_ENHANCE_V2)
taskRegistryV2.register(IMAGE_PRODUCT_PHOTO_V2)
