import type { Dispute, DisputeStatus, DisputeType } from '../models/dispute.js'

const disputes: Dispute[] = []

export function createDispute(
  taskExecutionId: string,
  userId: string,
  type: DisputeType,
  reason: string,
): Dispute {
  const dispute: Dispute = {
    id: `dispute_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
    taskExecutionId,
    userId,
    type,
    status: 'OPEN',
    reason,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  disputes.push(dispute)
  return dispute
}

export function getDisputeById(id: string): Dispute | undefined {
  return disputes.find((d) => d.id === id)
}

export function getDisputesByExecutionId(taskExecutionId: string): Dispute[] {
  return disputes.filter((d) => d.taskExecutionId === taskExecutionId)
}

export function getDisputesByUserId(userId: string): Dispute[] {
  return disputes.filter((d) => d.userId === userId)
}

export function getAllDisputes(): Dispute[] {
  return [...disputes].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}

export function getDisputesByStatus(status: DisputeStatus): Dispute[] {
  return disputes.filter((d) => d.status === status)
}

export function updateDisputeStatus(
  id: string,
  status: DisputeStatus,
  resolution?: string,
  decidedBy?: 'admin' | 'reviewer',
): Dispute | null {
  const dispute = disputes.find((d) => d.id === id)
  if (!dispute) {
    return null
  }

  dispute.status = status
  dispute.updatedAt = new Date().toISOString()

  if (resolution) {
    dispute.resolution = resolution
  }

  if (decidedBy) {
    dispute.decidedBy = decidedBy
    dispute.decidedAt = new Date().toISOString()
  }

  return dispute
}
