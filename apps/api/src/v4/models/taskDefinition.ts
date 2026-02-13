export type ProofType = 'none' | 'file' | 'human_validation'

export type ExecutionType = 'ai' | 'manual' | 'hybrid'

export type SLATier = 'standard' | 'priority' | 'enterprise'

export interface TaskDefinitionConfig {
  executionType?: ExecutionType
  proofType?: ProofType
  requiresProof?: boolean
  requiresValidation?: boolean
  [key: string]: unknown
}

export interface TaskPricing {
  amount: number
  currency: string
  slaTier: SLATier
  proofIncluded: boolean
}

export type TaskDefinition = {
  taskId: string
  version: string
  category: 'DOCUMENT' | 'PROOF' | 'ANALYSIS' | 'TRANSFORMATION'
  inputSchema: Record<string, unknown>
  outputFormat: string
  supportedLocales: Array<'EN' | 'FR' | 'NO' | 'ES' | 'AR'>
  supportedCurrencies: string[]
  config?: TaskDefinitionConfig
  pricing?: TaskPricing
}
