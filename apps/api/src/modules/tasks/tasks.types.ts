export interface TaskDefinition<Input, Output> {
  code: string
  version: number
  inputSchema: unknown
  outputSchema: unknown
  execute(input: Input): Promise<Output>
}
