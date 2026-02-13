import { getOpenAIClient } from '../../providers/openai/openai.client.js'
import path from 'path'
import { writeFile, mkdir } from 'fs/promises'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export type LetterType = 'avocat' | 'banque' | 'rh' | 'business'

export interface LetterGenerationParams {
  context: string
  recipient?: string
  language: 'fr' | 'en'
  letterType: LetterType
}

export interface LetterGenerationResult {
  letterText: string
  documentUrl: string
  format: 'PDF' | 'DOCX'
}

/**
 * Génère le prompt selon le type de lettre
 */
function getLetterPrompt(letterType: LetterType, language: 'fr' | 'en'): string {
  const prompts: Record<LetterType, { fr: string; en: string }> = {
    avocat: {
      fr: 'Tu es un assistant professionnel. Rédige une lettre professionnelle pour démarches juridiques et procédures. La lettre doit être formelle, claire et conforme aux usages professionnels.',
      en: 'You are a professional assistant. Write a professional letter for legal procedures and processes. The letter must be formal, clear and compliant with professional standards.',
    },
    banque: {
      fr: 'Tu es un assistant professionnel. Rédige une lettre professionnelle pour démarches bancaires et demandes de crédit. La lettre doit être formelle, claire et conforme aux usages bancaires.',
      en: 'You are a professional assistant. Write a professional letter for banking procedures and credit requests. The letter must be formal, clear and compliant with banking standards.',
    },
    rh: {
      fr: 'Tu es un assistant professionnel. Rédige une lettre professionnelle pour ressources humaines et relations professionnelles. La lettre doit être formelle, claire et conforme aux usages RH.',
      en: 'You are a professional assistant. Write a professional letter for human resources and professional relations. The letter must be formal, clear and compliant with HR standards.',
    },
    business: {
      fr: 'Tu es un assistant professionnel. Rédige une lettre professionnelle pour affaires et partenariats. La lettre doit être formelle, claire et conforme aux usages business.',
      en: 'You are a professional assistant. Write a professional letter for business and partnerships. The letter must be formal, clear and compliant with business standards.',
    },
  }

  return prompts[letterType][language]
}

/**
 * Génère une lettre professionnelle avec document PDF/DOCX
 */
export async function generateLetter(params: LetterGenerationParams): Promise<LetterGenerationResult> {
  const systemPrompt = getLetterPrompt(params.letterType, params.language)

  // 1. Générer le texte de la lettre via OpenAI
  const openai = getOpenAIClient()
  const userPrompt = params.language === 'fr'
    ? `Contexte: ${params.context}${params.recipient ? `\nDestinataire: ${params.recipient}` : ''}\n\nRédige une lettre professionnelle formatée, prête à l'envoi.`
    : `Context: ${params.context}${params.recipient ? `\nRecipient: ${params.recipient}` : ''}\n\nWrite a professional formatted letter, ready to send.`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: userPrompt,
      },
    ],
  })

  const letterText = response.choices[0]?.message?.content ?? ''

  // 2. Générer le document (PDF par défaut, DOCX optionnel)
  const documentUrl = await generateDocumentProof(letterText, params.letterType, 'PDF')

  return {
    letterText,
    documentUrl,
    format: 'PDF',
  }
}

/**
 * Génère un document PDF/DOCX comme preuve d'exécution
 * Note: En production, utiliser une vraie lib PDF/DOCX (puppeteer, docx, etc.)
 */
async function generateDocumentProof(
  letterText: string,
  letterType: LetterType,
  format: 'PDF' | 'DOCX',
): Promise<string> {
  // Créer le dossier uploads/letters si nécessaire
  const uploadsDir = path.join(process.cwd(), 'uploads', 'letters')
  await mkdir(uploadsDir, { recursive: true })

  // Générer un nom de fichier unique
  const timestamp = Date.now()
  const extension = format.toLowerCase()
  const filename = `lettre-${letterType}-${timestamp}.${extension}`
  const filepath = path.join(uploadsDir, filename)

  // En production, générer un vrai PDF/DOCX ici
  // Pour V4, on simule en créant un fichier texte qui représente le document
  const documentContent = `${format}_SIMULATION
Letter Type: ${letterType}
Format: ${format}
Generated: ${new Date().toISOString()}

${letterText}
`

  await writeFile(filepath, documentContent, 'utf-8')

  // Retourner l'URL relative
  return `/uploads/letters/${filename}`
}
