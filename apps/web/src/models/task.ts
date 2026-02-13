export type TaskCategoryId =
  | 'cv-career'
  | 'professional-letters'
  | 'legal'
  | 'business-ecommerce'
  | 'real-estate-airbnb'

export type TaskDeliverableType =
  | 'cv'
  | 'letter'
  | 'analysis'
  | 'document'
  | 'report'
  | 'checklist'

import { ProofType } from './proof'

export interface TaskCategory {
  id: TaskCategoryId
  name: string
  description: string
  icon?: string
}

export interface TaskDefinition {
  id: string
  categoryId: TaskCategoryId
  name: string
  description: string
  deliverableType: TaskDeliverableType
  deliverableDescription: string
  requiresProof: boolean
  proofType: ProofType
  active: boolean
  route: string
  price?: {
    amount: number
    currency: string
  }
}

export const TASK_CATEGORIES: TaskCategory[] = [
  {
    id: 'cv-career',
    name: 'CV & Carrière',
    description: 'CV professionnels, lettres de motivation, profils LinkedIn',
  },
  {
    id: 'professional-letters',
    name: 'Lettres professionnelles',
    description: 'Lettres de démission, recommandation, réclamation',
  },
  {
    id: 'legal',
    name: 'Juridique',
    description: 'Contrats, clauses, analyses juridiques',
  },
  {
    id: 'business-ecommerce',
    name: 'Business / E-commerce',
    description: 'Descriptions produits, fiches techniques, analyses marché',
  },
  {
    id: 'real-estate-airbnb',
    name: 'Immobilier / Airbnb',
    description: 'États des lieux, descriptions de biens, inventaires',
  },
]

import { ProofType } from './proof'

export const TASK_DEFINITIONS: TaskDefinition[] = [
  {
    id: 'cv-pro',
    categoryId: 'cv-career',
    name: 'CV Professionnel',
    description: 'Génération d\'un CV professionnel adapté au poste ciblé',
    deliverableType: 'cv',
    deliverableDescription: 'CV formaté, prêt à l\'envoi (PDF ou Word)',
    requiresProof: false,
    proofType: ProofType.NONE,
    active: true,
    route: '/tasks/cv/pro',
  },
  {
    id: 'lettre-motivation',
    categoryId: 'cv-career',
    name: 'Lettre de motivation',
    description: 'Lettre de motivation personnalisée pour une offre d\'emploi',
    deliverableType: 'letter',
    deliverableDescription: 'Lettre formatée, prête à l\'envoi',
    requiresProof: false,
    proofType: ProofType.NONE,
    active: true,
    route: '/tasks/cv/lettre-motivation',
  },
  {
    id: 'lettre-demission',
    categoryId: 'professional-letters',
    name: 'Lettre de démission',
    description: 'Lettre de démission conforme au droit du travail',
    deliverableType: 'letter',
    deliverableDescription: 'Lettre de démission formatée, conforme',
    requiresProof: false,
    proofType: ProofType.NONE,
    active: true,
    route: '/tasks/lettre/demission',
  },
  {
    id: 'lettre-avocat',
    categoryId: 'professional-letters',
    name: 'Lettre avocat',
    description: 'Lettre professionnelle pour démarches juridiques et procédures',
    deliverableType: 'letter',
    deliverableDescription: 'Lettre formatée, prête à l\'envoi',
    requiresProof: false,
    proofType: ProofType.NONE,
    active: true,
    route: '/tasks/lettre/avocat',
  },
  {
    id: 'lettre-banque',
    categoryId: 'professional-letters',
    name: 'Lettre banque',
    description: 'Lettre pour démarches bancaires et demandes de crédit',
    deliverableType: 'letter',
    deliverableDescription: 'Lettre formatée, prête à l\'envoi',
    requiresProof: false,
    proofType: ProofType.NONE,
    active: true,
    route: '/tasks/lettre/banque',
  },
  {
    id: 'lettre-rh',
    categoryId: 'professional-letters',
    name: 'Lettre RH',
    description: 'Lettre pour ressources humaines et relations professionnelles',
    deliverableType: 'letter',
    deliverableDescription: 'Lettre formatée, prête à l\'envoi',
    requiresProof: false,
    proofType: ProofType.NONE,
    active: true,
    route: '/tasks/lettre/rh',
  },
  {
    id: 'lettre-business',
    categoryId: 'professional-letters',
    name: 'Lettre business',
    description: 'Lettre professionnelle pour affaires et partenariats',
    deliverableType: 'letter',
    deliverableDescription: 'Lettre formatée, prête à l\'envoi',
    requiresProof: false,
    proofType: ProofType.NONE,
    active: true,
    route: '/tasks/lettre/business',
  },
  {
    id: 'lettre-juridique',
    categoryId: 'legal',
    name: 'Lettre juridique',
    description: 'Lettre de mise en demeure, réclamation légale',
    deliverableType: 'letter',
    deliverableDescription: 'Lettre juridique formatée, conforme',
    requiresProof: true,
    proofType: ProofType.HUMAN_VALIDATION,
    active: true,
    route: '/tasks/lettre/juridique',
  },
  {
    id: 'airbnb-etat-lieux',
    categoryId: 'real-estate-airbnb',
    name: 'État des lieux Airbnb',
    description: 'Génération d\'un état des lieux détaillé à partir de photos horodatées',
    deliverableType: 'document',
    deliverableDescription: 'État des lieux complet avec photos horodatées, prêt à l\'envoi',
    requiresProof: true,
    proofType: ProofType.FILE,
    active: true,
    route: '/tasks/airbnb/instructions/airbnb-etat-lieux',
  },
  {
    id: 'airbnb-description',
    categoryId: 'real-estate-airbnb',
    name: 'Description de bien Airbnb',
    description: 'Description optimisée pour une annonce Airbnb avec photos',
    deliverableType: 'document',
    deliverableDescription: 'Description avec photos horodatées, prête à publier',
    requiresProof: true,
    proofType: ProofType.FILE,
    active: true,
    route: '/tasks/airbnb/instructions/airbnb-description',
  },
  // Airbnb / Hospitality
  {
    id: 'airbnb-welcome-pack',
    categoryId: 'real-estate-airbnb',
    name: 'Welcome Pack',
    description: 'Pack d\'accueil complet pour voyageurs avec informations pratiques',
    deliverableType: 'document',
    deliverableDescription: 'Document PDF avec guide d\'accueil complet',
    requiresProof: false,
    proofType: ProofType.NONE,
    active: true,
    route: '/tasks/airbnb/hospitality/welcome-pack',
  },
  {
    id: 'airbnb-fiche-voyageur',
    categoryId: 'real-estate-airbnb',
    name: 'Fiche voyageur',
    description: 'Fiche d\'information pour voyageurs avec détails du séjour',
    deliverableType: 'document',
    deliverableDescription: 'PDF personnalisé avec informations du séjour',
    requiresProof: false,
    proofType: ProofType.NONE,
    active: true,
    route: '/tasks/airbnb/hospitality/fiche-voyageur',
  },
  {
    id: 'airbnb-acces-wifi-qr',
    categoryId: 'real-estate-airbnb',
    name: 'Accès & Wi-Fi (QR)',
    description: 'Document avec codes d\'accès et QR codes Wi-Fi',
    deliverableType: 'document',
    deliverableDescription: 'PDF avec QR codes passifs pour accès et Wi-Fi',
    requiresProof: false,
    proofType: ProofType.NONE,
    active: true,
    route: '/tasks/airbnb/hospitality/acces-wifi-qr',
  },
  {
    id: 'airbnb-instructions-arrivee-depart',
    categoryId: 'real-estate-airbnb',
    name: 'Instructions arrivée / départ',
    description: 'Guide détaillé pour l\'arrivée et le départ des voyageurs',
    deliverableType: 'document',
    deliverableDescription: 'PDF avec instructions claires d\'arrivée et départ',
    requiresProof: false,
    proofType: ProofType.NONE,
    active: true,
    route: '/tasks/airbnb/hospitality/instructions-arrivee-depart',
  },
  {
    id: 'airbnb-plan-localisation',
    categoryId: 'real-estate-airbnb',
    name: 'Plan & localisation',
    description: 'Plan du logement et informations de localisation',
    deliverableType: 'document',
    deliverableDescription: 'PDF avec plan et guide de localisation',
    requiresProof: false,
    proofType: ProofType.NONE,
    active: true,
    route: '/tasks/airbnb/hospitality/plan-localisation',
  },
  {
    id: 'airbnb-pack-multi-logement',
    categoryId: 'real-estate-airbnb',
    name: 'Pack multi-logement',
    description: 'Pack complet pour gestion de plusieurs logements',
    deliverableType: 'document',
    deliverableDescription: 'PDF avec documents standardisés pour multi-logements',
    requiresProof: false,
    proofType: ProofType.NONE,
    active: true,
    route: '/tasks/airbnb/hospitality/pack-multi-logement',
  },
]

export function getTasksByCategory(categoryId: TaskCategoryId): TaskDefinition[] {
  return TASK_DEFINITIONS.filter((task) => task.categoryId === categoryId && task.active)
}

export function getTaskById(id: string): TaskDefinition | undefined {
  return TASK_DEFINITIONS.find((task) => task.id === id)
}

export function getTaskByRoute(route: string): TaskDefinition | undefined {
  return TASK_DEFINITIONS.find((task) => task.route === route)
}
