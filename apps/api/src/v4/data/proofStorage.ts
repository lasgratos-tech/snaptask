import { mkdir, writeFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

const UPLOADS_DIR = join(process.cwd(), 'uploads', 'proofs')
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export async function ensureUploadsDir(executionId: string): Promise<string> {
  const dir = join(UPLOADS_DIR, executionId)
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true })
  }
  return dir
}

export function getProofUrl(executionId: string, filename: string): string {
  return `/uploads/proofs/${executionId}/${filename}`
}

export async function saveProofFile(
  executionId: string,
  filename: string,
  buffer: Buffer,
): Promise<string> {
  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error('FILE_TOO_LARGE')
  }

  const dir = await ensureUploadsDir(executionId)
  const filepath = join(dir, filename)
  await writeFile(filepath, buffer)
  return getProofUrl(executionId, filename)
}

export function isValidFileType(mimetype: string): boolean {
  return (
    mimetype.startsWith('image/') ||
    mimetype === 'application/pdf' ||
    mimetype === 'application/msword' ||
    mimetype ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  )
}
