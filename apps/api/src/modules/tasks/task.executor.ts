import { getTask } from './task.registry.js'

export async function executeTask<Input, Output>(
  taskCode: string,
  input: Input,
): Promise<Output> {
  const task = getTask(taskCode)

  return task.execute(input)
}
