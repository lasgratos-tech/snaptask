import type { TaskExecution } from '../data/taskExecutions.js'
import type { TaskDefinition } from '../models/taskDefinition.js'
import type { TaskStep } from '../models/taskStep.js'
import { taskStepToStatus } from '../models/taskStep.js'
import { getExecutionById, updateExecutionStatus } from '../data/taskExecutions.js'
import { createAuditLog } from '../data/auditLog.js'

/**
 * Règles de transition pour déterminer le step suivant
 */
export interface TransitionRules {
  from: TaskStep
  to: TaskStep
  condition: (execution: TaskExecution, definition: TaskDefinition) => boolean
}

/**
 * Détermine le step suivant basé sur l'état actuel et la configuration de la tâche
 */
export function determineNextStep(
  currentStep: TaskStep,
  execution: TaskExecution,
  definition: TaskDefinition,
): TaskStep | null {
  const config = definition.config || {}
  const proofType = config.proofType || 'none'
  const executionType = config.executionType || 'ai'
  const requiresProof = config.requiresProof ?? proofType !== 'none'
  const requiresValidation = config.requiresValidation ?? proofType === 'human_validation'

  // Transitions depuis INIT
  if (currentStep === 'INIT') {
    if (executionType === 'ai' || executionType === 'hybrid') {
      return 'EXECUTE'
    }
    if (requiresProof && proofType === 'file') {
      return 'WAIT_PROOF'
    }
    if (requiresValidation) {
      return 'WAIT_VALIDATION'
    }
    return 'COMPLETE'
  }

  // Transitions depuis EXECUTE
  if (currentStep === 'EXECUTE') {
    if (execution.deliverableUrl) {
      // Exécution réussie
      if (requiresProof && proofType === 'file') {
        return 'WAIT_PROOF'
      }
      if (requiresValidation) {
        return 'WAIT_VALIDATION'
      }
      return 'COMPLETE'
    }
    // Pas de livrable = échec
    return 'FAIL'
  }

  // Transitions depuis WAIT_PROOF
  if (currentStep === 'WAIT_PROOF') {
    if (execution.proofUrl) {
      // Preuve uploadée
      if (requiresValidation) {
        return 'WAIT_VALIDATION'
      }
      return 'COMPLETE'
    }
    return null // Reste en WAIT_PROOF tant que la preuve n'est pas uploadée
  }

  // Transitions depuis WAIT_VALIDATION
  if (currentStep === 'WAIT_VALIDATION') {
    if (execution.validationDecision === 'approved') {
      return 'COMPLETE'
    }
    if (execution.validationDecision === 'rejected') {
      return 'FAIL'
    }
    return null // Reste en WAIT_VALIDATION
  }

  // États terminaux
  if (currentStep === 'COMPLETE' || currentStep === 'FAIL') {
    return null // Pas de transition depuis les états terminaux
  }

  return null
}

/**
 * Exécute les effets associés à un step
 */
async function executeStepEffects(
  step: TaskStep,
  execution: TaskExecution,
  definition: TaskDefinition,
): Promise<void> {
  const config = definition.config || {}
  const executionType = config.executionType || 'ai'

  if (step === 'EXECUTE' && (executionType === 'ai' || executionType === 'hybrid')) {
    // TODO: Appeler le service d'exécution IA générique basé sur definition.config
    // Le service doit être configurable via config.executorConfig ou similaire
    // Pour l'instant, on simule avec un délai
    await new Promise((resolve) => setTimeout(resolve, 100))
    // Le deliverableUrl sera défini par le service d'exécution
    // updateExecutionDeliverable(execution.id, deliverableUrl)
  }
}

/**
 * Moteur principal d'exécution de tâche
 * Orchestre les transitions d'état basées sur la configuration de la tâche
 */
export async function runTaskExecution(taskExecutionId: string): Promise<TaskExecution | null> {
  const execution = getExecutionById(taskExecutionId)
  if (!execution) {
    return null
  }

  // Charger la TaskDefinition
  const { taskDefinitions } = await import('../data/taskDefinitions.js')
  const definition = taskDefinitions.find((def) => def.taskId === execution.taskId)
  if (!definition) {
    throw new Error(`TASK_DEFINITION_NOT_FOUND: ${execution.taskId}`)
  }

  // Déterminer le step actuel depuis le status
  const { statusToTaskStep } = await import('../models/taskStep.js')
  const currentStep = statusToTaskStep(execution.status)

  // Déterminer le step suivant
  const nextStep = determineNextStep(currentStep, execution, definition)
  if (!nextStep || nextStep === currentStep) {
    // Aucune transition nécessaire
    return execution
  }

  // Exécuter les effets du step suivant
  await executeStepEffects(nextStep, execution, definition)

  // Effectuer la transition
  const newStatus = taskStepToStatus(nextStep)
  const updated = updateExecutionStatus(taskExecutionId, newStatus as any)
  if (!updated) {
    throw new Error(`FAILED_TO_UPDATE_EXECUTION: ${taskExecutionId}`)
  }

  // Audit de la transition
  try {
    await createAuditLog(
      'TASK_STEP_CHANGED',
      'taskExecution',
      taskExecutionId,
      'system',
      undefined,
      {
        from: currentStep,
        to: nextStep,
        fromStatus: execution.status,
        toStatus: newStatus,
        taskId: execution.taskId,
      },
    )
  } catch (err) {
    console.error('Audit log failed:', err)
    // L'audit ne doit pas casser l'exécution
  }

  // Si on arrive à COMPLETE, déclencher les effets finaux (paiement, etc.)
  if (nextStep === 'COMPLETE') {
    await handleTaskCompletion(taskExecutionId, execution, definition)
  }

  // Si on arrive à FAIL, déclencher les effets d'échec
  if (nextStep === 'FAIL') {
    await handleTaskFailure(taskExecutionId, execution, definition)
  }

  return updated
}

/**
 * Gère la complétion d'une tâche
 */
async function handleTaskCompletion(
  taskExecutionId: string,
  execution: TaskExecution,
  definition: TaskDefinition,
): Promise<void> {
  try {
    const { createAuditLog } = await import('../data/auditLog.js')
    await createAuditLog(
      'TASK_COMPLETED',
      'taskExecution',
      taskExecutionId,
      'system',
      undefined,
      {
        completedAt: new Date().toISOString(),
        taskId: execution.taskId,
      },
    )

    // Autoriser le paiement si configuré (avec Stripe ESCROW)
    const { getTaskPricing } = await import('../data/taskPricing.js')
    const { createPaymentIntent, authorizePaymentIntent, updatePaymentIntentStripeId } = await import('../data/paymentIntents.js')
    const { createStripePaymentIntent } = await import('../services/stripe.service.js')
    const pricing = getTaskPricing(execution.taskId)
    if (pricing) {
      // Créer le PaymentIntent Stripe en mode ESCROW
      const stripeIntent = await createStripePaymentIntent({
        amount: pricing.amount,
        currency: pricing.currency,
        taskExecutionId: execution.id,
      })

      // Créer le PaymentIntent SnapTask
      const paymentIntent = createPaymentIntent(
        execution.id,
        pricing.amount,
        pricing.currency,
        stripeIntent.id,
      )
      authorizePaymentIntent(paymentIntent.id)

      // Lier le Stripe PaymentIntent
      updatePaymentIntentStripeId(paymentIntent.id, stripeIntent.id)

      await createAuditLog(
        'STRIPE_PAYMENT_INTENT_CREATED',
        'taskExecution',
        taskExecutionId,
        'system',
        undefined,
        {
          paymentIntentId: paymentIntent.id,
          stripePaymentIntentId: stripeIntent.id,
          amount: pricing.amount,
          currency: pricing.currency,
        },
      )

      await createAuditLog(
        'PAYMENT_AUTHORIZED',
        'taskExecution',
        taskExecutionId,
        'system',
        undefined,
        {
          paymentIntentId: paymentIntent.id,
          stripePaymentIntentId: stripeIntent.id,
          amount: pricing.amount,
          currency: pricing.currency,
        },
      )
    }
  } catch (err) {
    console.error('Task completion handling failed:', err)
  }
}

/**
 * Gère l'échec d'une tâche
 */
async function handleTaskFailure(
  taskExecutionId: string,
  execution: TaskExecution,
  definition: TaskDefinition,
): Promise<void> {
  try {
    const { createAuditLog } = await import('../data/auditLog.js')
    await createAuditLog(
      'TASK_REJECTED',
      'taskExecution',
      taskExecutionId,
      'system',
      undefined,
      {
        rejectedAt: new Date().toISOString(),
        taskId: execution.taskId,
        reason: execution.rejectedReason || 'Task execution failed',
      },
    )

    // Annuler le paiement si existant
    const { getPaymentIntentByExecutionId, cancelPaymentIntent } = await import('../data/paymentIntents.js')
    const paymentIntent = getPaymentIntentByExecutionId(taskExecutionId)
    if (paymentIntent && paymentIntent.status !== 'captured') {
      cancelPaymentIntent(paymentIntent.id, `Task failed: ${execution.rejectedReason || 'Unknown error'}`)
      await createAuditLog(
        'PAYMENT_CANCELED',
        'taskExecution',
        taskExecutionId,
        'system',
        undefined,
        {
          paymentIntentId: paymentIntent.id,
          reason: `Task failed: ${execution.rejectedReason || 'Unknown error'}`,
        },
      )
    }
  } catch (err) {
    console.error('Task failure handling failed:', err)
  }
}
