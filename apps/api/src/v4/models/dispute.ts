export type DisputeType = 'result' | 'proof' | 'validation'

export type DisputeStatus =
  | 'OPEN'
  | 'UNDER_REVIEW'
  | 'RESOLVED_IN_FAVOR_USER'
  | 'RESOLVED_IN_FAVOR_SNAPTASK'
  | 'CLOSED'

export interface Dispute {
  id: string
  taskExecutionId: string
  userId: string
  type: DisputeType
  status: DisputeStatus
  reason: string
  resolution?: string
  decidedBy?: 'admin' | 'reviewer'
  decidedAt?: string
  createdAt: string
  updatedAt: string
}
