/**
 * Métadonnées d'une preuve photo pour tâches immobilier
 * Stockées avec la photo originale, jamais modifiées
 */
export interface PhotoProofMetadata {
  /** ID de l'exécution de tâche (lien strict) */
  executionId: string
  /** ID de la tâche (lien strict) */
  taskId: string
  /** Horodatage de capture (ISO 8601) */
  capturedAt: string
  /** Horodatage d'upload (ISO 8601) */
  uploadedAt: string
  /** Type MIME de la photo originale */
  mimeType: string
  /** Taille du fichier en octets */
  fileSize: number
  /** Nom du fichier original */
  originalFilename?: string
  /** URL de la photo originale (stockage) */
  photoUrl: string
  /** Hash SHA-256 de la photo (intégrité) */
  fileHash?: string
  /** Coordonnées GPS si disponibles */
  gpsCoordinates?: {
    latitude: number
    longitude: number
  }
}
