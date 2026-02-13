/**
 * Machine à états du Task Engine
 * Chaque étape représente un état dans le cycle de vie d'une exécution de tâche
 */
export type TaskStep =
  | 'INIT' // État initial, exécution créée
  | 'EXECUTE' // Exécution de la tâche IA en cours
  | 'WAIT_PROOF' // En attente de preuve d'exécution
  | 'WAIT_VALIDATION' // En attente de validation humaine
  | 'COMPLETE' // Tâche terminée avec succès
  | 'FAIL' // Échec de la tâche

/**
 * Mapping entre TaskStep et TaskExecutionStatus legacy
 */
export function taskStepToStatus(step: TaskStep): string {
  switch (step) {
    case 'INIT':
      return 'PENDING'
    case 'EXECUTE':
      return 'PROCESSING'
    case 'WAIT_PROOF':
      return 'WAITING_PROOF'
    case 'WAIT_VALIDATION':
      return 'WAITING_VALIDATION'
    case 'COMPLETE':
      return 'COMPLETED'
    case 'FAIL':
      return 'REJECTED'
    default:
      return 'PENDING'
  }
}

export function statusToTaskStep(status: string): TaskStep {
  switch (status) {
    case 'PENDING':
      return 'INIT'
    case 'PROCESSING':
      return 'EXECUTE'
    case 'WAITING_PROOF':
      return 'WAIT_PROOF'
    case 'WAITING_VALIDATION':
      return 'WAIT_VALIDATION'
    case 'COMPLETED':
      return 'COMPLETE'
    case 'REJECTED':
      return 'FAIL'
    default:
      return 'INIT'
  }
}
