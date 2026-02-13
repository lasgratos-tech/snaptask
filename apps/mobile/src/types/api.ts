export type TaskCategory = 'DOCUMENT' | 'PROOF' | 'ANALYSIS' | 'TRANSFORMATION'

export type TaskInputField = {
  id: string
  label: string
  type: 'text' | 'enum' | 'file'
  required: boolean
  options?: Array<{ label: string; value: string }>
  constraints?: {
    minLength?: number
    maxLength?: number
    formats?: string[]
    maxSizeMb?: number
  }
}

export type TaskSummary = {
  taskCode: string
  version: number
  name: string
  category: TaskCategory
  price: number
  currency: string
  deliverable: string
}

export type TaskDefinition = TaskSummary & {
  resultSummary: string
  inputs: TaskInputField[]
}

export type TaskInputValue =
  | { type: 'text'; value: string }
  | { type: 'enum'; value: string }
  | { type: 'file'; value: FileReference }

export type FileReference = {
  uri: string
  name: string
  mimeType?: string
  size?: number
}

export type TaskInputValues = Record<string, TaskInputValue>

export type CatalogueResponse = {
  version: string
  tasks: TaskSummary[]
}

export type ExecuteResponse = unknown
