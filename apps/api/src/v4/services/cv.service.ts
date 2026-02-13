import { runOpenAICvProfessional } from '../../providers/openai/openai.client.js'
import path from 'path'
import { writeFile, mkdir } from 'fs/promises'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export type CvType = 'standard' | 'expert' | 'executive'

export interface CvGenerationParams {
  profileText: string
  targetRole: string
  language: 'fr' | 'en'
  cvType: CvType
}

export interface CvGenerationResult {
  cvText: string
  pdfUrl: string
  pages: 1 | 2
  model: string
}

/**
 * Détermine automatiquement le nombre de pages selon le type de CV
 */
function determinePages(cvType: CvType, targetRole: string, cvText: string): 1 | 2 {
  if (cvType === 'standard') {
    return 1
  }
  if (cvType === 'expert') {
    return 2
  }
  // Executive : décision basée sur le contenu
  const isSenior = /senior|lead|principal|director|head|chief|executive|expert|architect/i.test(targetRole)
  const lines = cvText.split('\n').length
  return isSenior || lines > 80 ? 2 : 1
}

/**
 * Sélectionne le modèle selon le type de CV
 */
function selectModel(cvType: CvType): string {
  switch (cvType) {
    case 'standard':
      return 'creative'
    case 'expert':
      return 'expert'
    case 'executive':
      return 'executive'
  }
}

/**
 * Génère un CV avec texte et PDF
 */
export async function generateCv(params: CvGenerationParams): Promise<CvGenerationResult> {
  // 1. Générer le texte du CV via OpenAI
  const result = await runOpenAICvProfessional({
    profileText: params.profileText,
    targetRole: params.targetRole,
    language: params.language,
  })

  const cvText = result.output

  // 2. Déterminer le nombre de pages
  const pages = determinePages(params.cvType, params.targetRole, cvText)
  const model = selectModel(params.cvType)

  // 3. Générer le PDF (simulation - en prod utiliser une lib PDF réelle)
  const pdfUrl = await generatePdfProof(cvText, params.cvType, pages, model)

  return {
    cvText,
    pdfUrl,
    pages,
    model,
  }
}

/**
 * Génère un PDF comme preuve d'exécution
 * Note: En production, utiliser une vraie lib PDF (puppeteer, pdfkit, etc.)
 */
async function generatePdfProof(
  cvText: string,
  cvType: CvType,
  pages: 1 | 2,
  model: string,
): Promise<string> {
  // Créer le dossier uploads/cv si nécessaire
  const uploadsDir = path.join(process.cwd(), 'uploads', 'cv')
  await mkdir(uploadsDir, { recursive: true })

  // Générer un nom de fichier unique
  const timestamp = Date.now()
  const filename = `cv-${cvType}-${timestamp}.pdf`
  const filepath = path.join(uploadsDir, filename)

  // En production, générer un vrai PDF ici
  // Pour V4, on simule en créant un fichier texte qui représente le PDF
  const pdfContent = `PDF_SIMULATION
CV Type: ${cvType}
Model: ${model}
Pages: ${pages}
Generated: ${new Date().toISOString()}

${cvText}
`

  await writeFile(filepath, pdfContent, 'utf-8')

  // Retourner l'URL relative
  return `/uploads/cv/${filename}`
}
