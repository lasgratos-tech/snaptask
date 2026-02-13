import path from 'path'
import { writeFile, mkdir, readFile } from 'fs/promises'
import { existsSync } from 'fs'
import { fileURLToPath } from 'url'
import type { PhotoProofMetadata } from '../models/proofMetadata.js'
import { getPhotoMetadata } from '../data/photoProofStorage.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export interface AirbnbGenerationParams {
  executionId: string
  taskId: string
  photoUrl: string
}

export interface AirbnbGenerationResult {
  documentUrl: string
  proofUrl: string
  metadata: PhotoProofMetadata
}

/**
 * Génère un document PDF avec photo horodatée pour les tâches Airbnb
 * Utilise la photo originale avec ses métadonnées horodatées
 * Note: En production, utiliser une vraie lib PDF (puppeteer, pdfkit, etc.)
 */
export async function generateAirbnbDocument(params: AirbnbGenerationParams): Promise<AirbnbGenerationResult> {
  // Récupérer les métadonnées de la preuve photo
  const metadata = await getPhotoMetadata(params.executionId)
  if (!metadata) {
    throw new Error('PHOTO_METADATA_NOT_FOUND')
  }

  // Vérifier le lien strict avec Task ID
  if (metadata.taskId !== params.taskId) {
    throw new Error('TASK_ID_MISMATCH')
  }

  if (metadata.executionId !== params.executionId) {
    throw new Error('EXECUTION_ID_MISMATCH')
  }

  // Créer le dossier uploads/airbnb si nécessaire
  const uploadsDir = path.join(process.cwd(), 'uploads', 'airbnb')
  await mkdir(uploadsDir, { recursive: true })

  const timestamp = Date.now()
  const filename = `airbnb-${params.taskId}-${params.executionId}-${timestamp}.pdf`
  const filepath = path.join(uploadsDir, filename)

  // En production, générer un vrai PDF avec :
  // - La photo originale
  // - Les métadonnées horodatées (capturedAt, uploadedAt)
  // - Le hash de vérification
  // - Les coordonnées GPS si disponibles
  // Pour V4, on simule en créant un fichier texte qui représente le PDF
  const documentContent = `PDF_SIMULATION - Document généré depuis preuve photo horodatée
================================================================================
Task ID: ${metadata.taskId}
Execution ID: ${metadata.executionId}
Photo URL: ${metadata.photoUrl}
Photo Hash: ${metadata.fileHash}

MÉTADONNÉES HORODATÉES:
- Capture: ${metadata.capturedAt}
- Upload: ${metadata.uploadedAt}
- Type: ${metadata.mimeType}
- Taille: ${metadata.fileSize} octets
- Fichier original: ${metadata.originalFilename || 'N/A'}

${metadata.gpsCoordinates ? `GPS: ${metadata.gpsCoordinates.latitude}, ${metadata.gpsCoordinates.longitude}` : 'GPS: Non disponible'}

Généré le: ${new Date().toISOString()}

Document généré avec photo originale horodatée comme preuve d'exécution.
Les métadonnées garantissent l'intégrité et la traçabilité de la preuve.
================================================================================
`

  await writeFile(filepath, documentContent, 'utf-8')

  // Retourner les URLs relatives et les métadonnées
  return {
    documentUrl: `/uploads/airbnb/${filename}`,
    proofUrl: metadata.photoUrl, // La photo originale est la preuve
    metadata,
  }
}
