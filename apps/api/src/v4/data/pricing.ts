import type { TaskPricing, SLATier } from '../models/taskDefinition.js'
import { createAuditLog } from './auditLog.js'

/**
 * Historique des changements de pricing
 */
export interface PricingHistory {
  id: string
  taskId: string
  version: string
  oldPricing: TaskPricing | null
  newPricing: TaskPricing
  changedBy: string
  changedAt: string
  reason?: string
}

const pricingHistory: PricingHistory[] = []

/**
 * Enregistre un changement de pricing avec audit
 */
export function recordPricingChange(
  taskId: string,
  version: string,
  oldPricing: TaskPricing | null,
  newPricing: TaskPricing,
  changedBy: string,
  reason?: string,
): PricingHistory {
  const history: PricingHistory = {
    id: `pricing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    taskId,
    version,
    oldPricing,
    newPricing,
    changedBy,
    changedAt: new Date().toISOString(),
    reason,
  }

  pricingHistory.push(history)

  // Audit log
  createAuditLog(
    'PRICING_UPDATED',
    'pricing',
    taskId,
    'admin',
    changedBy,
    {
      taskId,
      version,
      oldPricing,
      newPricing,
      reason,
    },
  )

  return history
}

/**
 * Récupère l'historique de pricing pour une tâche
 */
export function getPricingHistory(taskId: string, version?: string): PricingHistory[] {
  return pricingHistory
    .filter((h) => h.taskId === taskId && (!version || h.version === version))
    .sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime())
}

/**
 * Récupère tout l'historique de pricing
 */
export function getAllPricingHistory(limit = 100): PricingHistory[] {
  return pricingHistory
    .sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime())
    .slice(0, limit)
}
