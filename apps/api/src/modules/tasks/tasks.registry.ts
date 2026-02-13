import type { TaskDefinition } from './tasks.types.js'

const registry = new Map<string, TaskDefinition<any, any>>()

export function registerTask(task: TaskDefinition<any, any>) {
  if (registry.has(task.code)) {
    throw new Error(`TASK_ALREADY_REGISTERED: ${task.code}`)
  }

  registry.set(task.code, task)
}

export function getTask(code: string) {
  const task = registry.get(code)

  if (!task) {
    throw new Error(`TASK_NOT_FOUND: ${code}`)
  }

  return task
}
