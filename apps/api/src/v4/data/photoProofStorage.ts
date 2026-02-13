import { mkdir, writeFile, readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { createHash } from 'crypto'
import type { PhotoProofMetadata } from '../models/proofMetadata.js'

const UPLOADS_DIR = join(process.cwd(), 'uploads', 'photo-proofs')
const METADATA_DIR = join(process.cwd(), 'uploads', 'photo-proofs-metadata')
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

/**
 * Structure de stockage : uploads/photo-proofs/{executionId}/{timestamp}-{filename}
 * Métadonnées : uploads/photo-proofs-metadata/{executionId}.json
 */

export async function ensurePhotoProofDir(executionId: string): Promise<string> {
  const dir = join(UPLOADS_DIR, executionId)
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true })
  }
  return dir
}

export async function ensureMetadataDir(): Promise<string> {
  if (!existsSync(METADATA_DIR)) {
    await mkdir(METADATA_DIR, { recursive: true })
  }
  return METADATA_DIR
}

/**
 * Calcule le hash SHA-256 d'un buffer pour vérification d'intégrité
 */
export function computeFileHash(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex')
}

/**
 * Sauvegarde une photo originale avec ses métadonnées horodatées
 * Lien strict avec executionId et taskId
 * Les métadonnées ne peuvent jamais être modifiées après création
 */
export async function savePhotoProof(
  executionId: string,
  taskId: string,
  buffer: Buffer,
  originalFilename: string,
  mimeType: string,
  capturedAt?: string, // Horodatage de capture si fourni
): Promise<{ photoUrl: string; metadata: PhotoProofMetadata }> {
  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error('FILE_TOO_LARGE')
  }

  // Vérifier que c'est bien une image
  if (!mimeType.startsWith('image/')) {
    throw new Error('INVALID_FILE_TYPE')
  }

  const now = new Date().toISOString()
  const timestamp = Date.now()
  const fileHash = computeFileHash(buffer)

  // Nom de fichier sécurisé : timestamp-originalname
  const safeFilename = `${timestamp}-${originalFilename.replace(/[^a-zA-Z0-9.-]/g, '_')}`
  const photoDir = await ensurePhotoProofDir(executionId)
  const photoPath = join(photoDir, safeFilename)
  await writeFile(photoPath, buffer)

  const photoUrl = `/uploads/photo-proofs/${executionId}/${safeFilename}`

  // Créer les métadonnées horodatées
  const metadata: PhotoProofMetadata = {
    executionId,
    taskId,
    capturedAt: capturedAt || now, // Utiliser horodatage fourni ou maintenant
    uploadedAt: now,
    mimeType,
    fileSize: buffer.length,
    originalFilename,
    photoUrl,
    fileHash,
  }

  // Sauvegarder les métadonnées (une seule fois, jamais modifiées)
  await savePhotoMetadata(executionId, metadata)

  return { photoUrl, metadata }
}

/**
 * Sauvegarde les métadonnées d'une preuve photo
 * Les métadonnées sont append-only, jamais modifiées
 */
async function savePhotoMetadata(
  executionId: string,
  metadata: PhotoProofMetadata,
): Promise<void> {
  const metadataDir = await ensureMetadataDir()
  const metadataPath = join(metadataDir, `${executionId}.json`)

  // Si le fichier existe déjà, vérifier qu'on ne le modifie pas
  if (existsSync(metadataPath)) {
    const existing = JSON.parse(await readFile(metadataPath, 'utf-8')) as PhotoProofMetadata
    if (existing.fileHash !== metadata.fileHash) {
      throw new Error('PROOF_METADATA_IMMUTABLE')
    }
    // Métadonnées identiques, pas besoin de réécrire
    return
  }

  await writeFile(metadataPath, JSON.stringify(metadata, null, 2), 'utf-8')
}

/**
 * Récupère les métadonnées d'une preuve photo
 */
export async function getPhotoMetadata(executionId: string): Promise<PhotoProofMetadata | null> {
  const metadataPath = join(METADATA_DIR, `${executionId}.json`)
  if (!existsSync(metadataPath)) {
    return null
  }

  try {
    const content = await readFile(metadataPath, 'utf-8')
    return JSON.parse(content) as PhotoProofMetadata
  } catch {
    return null
  }
}

/**
 * Vérifie l'intégrité d'une photo en comparant son hash
 */
export async function verifyPhotoIntegrity(
  executionId: string,
  buffer: Buffer,
): Promise<boolean> {
  const metadata = await getPhotoMetadata(executionId)
  if (!metadata || !metadata.fileHash) {
    return false
  }

  const currentHash = computeFileHash(buffer)
  return currentHash === metadata.fileHash
}
