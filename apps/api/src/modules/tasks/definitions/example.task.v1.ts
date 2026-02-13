import type { TaskDefinition } from '../tasks.types.js'
interface ExampleInput {
  text: string
}

interface ExampleOutput {
  length: number
}

export const exampleTaskV1: TaskDefinition<ExampleInput, ExampleOutput> = {
  code: 'TEXT_LENGTH',
  version: 1,
  inputSchema: null,
  outputSchema: null,

  async execute(input) {
    return {
      length: input.text.length,
    }
  },
}
