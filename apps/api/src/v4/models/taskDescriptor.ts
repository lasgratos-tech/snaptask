import type { Locale } from './locale'
import type { Money } from './money'

export type TaskDescriptor = {
  taskId: string
  version: string
  category: 'DOCUMENT' | 'PROOF' | 'ANALYSIS' | 'TRANSFORMATION'
  title: string
  description: string
  locale: Locale
  price: Money
  outputFormat: string
  inputSchema: Record<string, unknown>
}
