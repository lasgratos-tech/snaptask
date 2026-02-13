import type { TaskDefinition, TaskPricing } from '../models/taskDefinition.js'

type TaskDefinitionRecord = TaskDefinition & { pricing: TaskPricing }

export const taskDefinitions: readonly TaskDefinitionRecord[] = [
  {
    taskId: 'TASK_DEFINITION_PLACEHOLDER',
    version: 'v4.0',
    category: 'DOCUMENT',
    inputSchema: { requiredKeys: [] },
    outputFormat: 'PDF',
    supportedLocales: ['EN'],
    supportedCurrencies: ['USD'],
    pricing: {
      amount: 1000,
      currency: 'USD',
      slaTier: 'standard',
      proofIncluded: false,
    },
    config: {
      executionType: 'ai',
      proofType: 'none',
      requiresProof: false,
      requiresValidation: false,
    },
  },
  // Exemple : Tâche avec preuve par fichier
  {
    taskId: 'airbnb-etat-lieux',
    version: 'v4.0',
    category: 'PROOF',
    inputSchema: { requiredKeys: ['propertyId'] },
    outputFormat: 'PDF',
    supportedLocales: ['FR', 'EN'],
    supportedCurrencies: ['EUR', 'USD'],
    pricing: {
      amount: 500,
      currency: 'EUR',
      slaTier: 'standard',
      proofIncluded: true,
    },
    config: {
      executionType: 'ai',
      proofType: 'file',
      requiresProof: true,
      requiresValidation: false,
    },
  },
  {
    taskId: 'airbnb-description',
    version: 'v4.0',
    category: 'PROOF',
    inputSchema: { requiredKeys: ['propertyId'] },
    outputFormat: 'PDF',
    supportedLocales: ['FR', 'EN'],
    supportedCurrencies: ['EUR', 'USD'],
    pricing: {
      amount: 400,
      currency: 'EUR',
      slaTier: 'standard',
      proofIncluded: true,
    },
    config: {
      executionType: 'ai',
      proofType: 'file',
      requiresProof: true,
      requiresValidation: false,
    },
  },
  // Airbnb / Hospitality
  {
    taskId: 'airbnb-welcome-pack',
    version: 'v4.0',
    category: 'DOCUMENT',
    inputSchema: { requiredKeys: ['propertyName', 'guestName'] },
    outputFormat: 'PDF',
    supportedLocales: ['FR', 'EN'],
    supportedCurrencies: ['EUR', 'USD'],
    pricing: {
      amount: 300,
      currency: 'EUR',
      slaTier: 'standard',
      proofIncluded: false,
    },
    config: {
      executionType: 'ai',
      proofType: 'none',
      requiresProof: false,
      requiresValidation: false,
    },
  },
  {
    taskId: 'airbnb-fiche-voyageur',
    version: 'v4.0',
    category: 'DOCUMENT',
    inputSchema: { requiredKeys: ['guestName', 'checkIn', 'checkOut'] },
    outputFormat: 'PDF',
    supportedLocales: ['FR', 'EN'],
    supportedCurrencies: ['EUR', 'USD'],
    pricing: {
      amount: 250,
      currency: 'EUR',
      slaTier: 'standard',
      proofIncluded: false,
    },
    config: {
      executionType: 'ai',
      proofType: 'none',
      requiresProof: false,
      requiresValidation: false,
    },
  },
  {
    taskId: 'airbnb-acces-wifi-qr',
    version: 'v4.0',
    category: 'DOCUMENT',
    inputSchema: { requiredKeys: ['wifiPassword', 'accessCode'] },
    outputFormat: 'PDF',
    supportedLocales: ['FR', 'EN'],
    supportedCurrencies: ['EUR', 'USD'],
    pricing: {
      amount: 200,
      currency: 'EUR',
      slaTier: 'standard',
      proofIncluded: false,
    },
    config: {
      executionType: 'ai',
      proofType: 'none',
      requiresProof: false,
      requiresValidation: false,
    },
  },
  {
    taskId: 'airbnb-instructions-arrivee-depart',
    version: 'v4.0',
    category: 'DOCUMENT',
    inputSchema: { requiredKeys: ['propertyAddress', 'checkInTime', 'checkOutTime'] },
    outputFormat: 'PDF',
    supportedLocales: ['FR', 'EN'],
    supportedCurrencies: ['EUR', 'USD'],
    pricing: {
      amount: 350,
      currency: 'EUR',
      slaTier: 'standard',
      proofIncluded: false,
    },
    config: {
      executionType: 'ai',
      proofType: 'none',
      requiresProof: false,
      requiresValidation: false,
    },
  },
  {
    taskId: 'airbnb-plan-localisation',
    version: 'v4.0',
    category: 'DOCUMENT',
    inputSchema: { requiredKeys: ['propertyAddress', 'coordinates'] },
    outputFormat: 'PDF',
    supportedLocales: ['FR', 'EN'],
    supportedCurrencies: ['EUR', 'USD'],
    pricing: {
      amount: 400,
      currency: 'EUR',
      slaTier: 'standard',
      proofIncluded: false,
    },
    config: {
      executionType: 'ai',
      proofType: 'none',
      requiresProof: false,
      requiresValidation: false,
    },
  },
  {
    taskId: 'airbnb-pack-multi-logement',
    version: 'v4.0',
    category: 'DOCUMENT',
    inputSchema: { requiredKeys: ['properties'] },
    outputFormat: 'PDF',
    supportedLocales: ['FR', 'EN'],
    supportedCurrencies: ['EUR', 'USD'],
    pricing: {
      amount: 600,
      currency: 'EUR',
      slaTier: 'standard',
      proofIncluded: false,
    },
    config: {
      executionType: 'ai',
      proofType: 'none',
      requiresProof: false,
      requiresValidation: false,
    },
  },
  // Exemple : Tâche avec validation humaine
  {
    taskId: 'lettre-juridique',
    version: 'v4.0',
    category: 'DOCUMENT',
    inputSchema: { requiredKeys: ['content', 'recipient'] },
    outputFormat: 'PDF',
    supportedLocales: ['FR'],
    supportedCurrencies: ['EUR'],
    pricing: {
      amount: 300,
      currency: 'EUR',
      slaTier: 'priority',
      proofIncluded: true,
    },
    config: {
      executionType: 'ai',
      proofType: 'human_validation',
      requiresProof: true,
      requiresValidation: true,
    },
  },
  // CV Standard (1 page)
  {
    taskId: 'cv-standard',
    version: 'v4.0',
    category: 'DOCUMENT',
    inputSchema: { requiredKeys: ['profileText', 'targetRole'] },
    outputFormat: 'PDF',
    supportedLocales: ['FR', 'EN'],
    supportedCurrencies: ['EUR', 'USD'],
    pricing: {
      amount: 1500,
      currency: 'EUR',
      slaTier: 'standard',
      proofIncluded: true,
    },
    config: {
      executionType: 'ai',
      proofType: 'file',
      requiresProof: true,
      requiresValidation: false,
    },
  },
  // CV Expert (2 pages)
  {
    taskId: 'cv-expert',
    version: 'v4.0',
    category: 'DOCUMENT',
    inputSchema: { requiredKeys: ['profileText', 'targetRole'] },
    outputFormat: 'PDF',
    supportedLocales: ['FR', 'EN'],
    supportedCurrencies: ['EUR', 'USD'],
    pricing: {
      amount: 2500,
      currency: 'EUR',
      slaTier: 'priority',
      proofIncluded: true,
    },
    config: {
      executionType: 'ai',
      proofType: 'file',
      requiresProof: true,
      requiresValidation: false,
    },
  },
  // CV Executive
  {
    taskId: 'cv-executive',
    version: 'v4.0',
    category: 'DOCUMENT',
    inputSchema: { requiredKeys: ['profileText', 'targetRole'] },
    outputFormat: 'PDF',
    supportedLocales: ['FR', 'EN'],
    supportedCurrencies: ['EUR', 'USD'],
    pricing: {
      amount: 3500,
      currency: 'EUR',
      slaTier: 'enterprise',
      proofIncluded: true,
    },
    config: {
      executionType: 'ai',
      proofType: 'file',
      requiresProof: true,
      requiresValidation: false,
    },
  },
  // Lettre avocat
  {
    taskId: 'lettre-avocat',
    version: 'v4.0',
    category: 'DOCUMENT',
    inputSchema: { requiredKeys: ['context'] },
    outputFormat: 'PDF',
    supportedLocales: ['FR', 'EN'],
    supportedCurrencies: ['EUR', 'USD'],
    pricing: {
      amount: 1200,
      currency: 'EUR',
      slaTier: 'standard',
      proofIncluded: true,
    },
    config: {
      executionType: 'ai',
      proofType: 'file',
      requiresProof: true,
      requiresValidation: false,
    },
  },
  // Lettre banque
  {
    taskId: 'lettre-banque',
    version: 'v4.0',
    category: 'DOCUMENT',
    inputSchema: { requiredKeys: ['context'] },
    outputFormat: 'PDF',
    supportedLocales: ['FR', 'EN'],
    supportedCurrencies: ['EUR', 'USD'],
    pricing: {
      amount: 1000,
      currency: 'EUR',
      slaTier: 'standard',
      proofIncluded: true,
    },
    config: {
      executionType: 'ai',
      proofType: 'file',
      requiresProof: true,
      requiresValidation: false,
    },
  },
  // Lettre RH
  {
    taskId: 'lettre-rh',
    version: 'v4.0',
    category: 'DOCUMENT',
    inputSchema: { requiredKeys: ['context'] },
    outputFormat: 'PDF',
    supportedLocales: ['FR', 'EN'],
    supportedCurrencies: ['EUR', 'USD'],
    pricing: {
      amount: 800,
      currency: 'EUR',
      slaTier: 'standard',
      proofIncluded: true,
    },
    config: {
      executionType: 'ai',
      proofType: 'file',
      requiresProof: true,
      requiresValidation: false,
    },
  },
  // Lettre business
  {
    taskId: 'lettre-business',
    version: 'v4.0',
    category: 'DOCUMENT',
    inputSchema: { requiredKeys: ['context'] },
    outputFormat: 'PDF',
    supportedLocales: ['FR', 'EN'],
    supportedCurrencies: ['EUR', 'USD'],
    pricing: {
      amount: 900,
      currency: 'EUR',
      slaTier: 'standard',
      proofIncluded: true,
    },
    config: {
      executionType: 'ai',
      proofType: 'file',
      requiresProof: true,
      requiresValidation: false,
    },
  },
]

/**
 * Récupère une définition de tâche par ID et version
 */
export function getTaskDefinition(taskId: string, version: string): TaskDefinitionRecord | undefined {
  return taskDefinitions.find((def) => def.taskId === taskId && def.version === version)
}

/**
 * Met à jour le pricing d'une tâche (mock - en prod ce serait dans la DB)
 * Note: Cette fonction ne modifie pas réellement le tableau readonly
 * En production, ceci serait une mutation DB
 */
export async function updateTaskPricing(
  taskId: string,
  version: string,
  newPricing: TaskPricing,
  changedBy: string,
  reason?: string,
): Promise<TaskDefinitionRecord | null> {
  const def = getTaskDefinition(taskId, version)
  if (!def) {
    return null
  }

  const oldPricing = def.pricing

  // Enregistrer le changement dans l'historique
  const { recordPricingChange } = await import('./pricing.js')
  recordPricingChange(taskId, version, oldPricing, newPricing, changedBy, reason)

  // Retourner la version mise à jour (en prod, ceci serait la nouvelle entrée DB)
  return { ...def, pricing: newPricing }
}
