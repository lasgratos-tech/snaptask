import type { TaskDefinition, TaskInputValues, ExecuteResponse } from '../types/api'

export type RootStackParamList = {
  Catalogue: undefined
  Task: { task: TaskDefinition }
  Payment: { task: TaskDefinition; input: TaskInputValues }
  Delivery: { result: ExecuteResponse }
}
