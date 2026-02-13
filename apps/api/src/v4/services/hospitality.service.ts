import path from 'path'
import { writeFile, mkdir } from 'fs/promises'

export type HospitalityTaskType =
  | 'welcome-pack'
  | 'fiche-voyageur'
  | 'acces-wifi-qr'
  | 'instructions-arrivee-depart'
  | 'plan-localisation'
  | 'pack-multi-logement'

export interface HospitalityGenerationParams {
  taskType: HospitalityTaskType
  context: Record<string, unknown>
}

export interface HospitalityGenerationResult {
  documentUrl: string
}

/**
 * Génère un document PDF pour les tâches Hospitality
 * Note: En production, utiliser une vraie lib PDF (puppeteer, pdfkit, etc.)
 * Pour les QR codes, utiliser une lib comme 'qrcode' pour générer des QR passifs
 */
export async function generateHospitalityDocument(
  params: HospitalityGenerationParams,
): Promise<HospitalityGenerationResult> {
  const uploadsDir = path.join(process.cwd(), 'uploads', 'hospitality')
  await mkdir(uploadsDir, { recursive: true })

  const timestamp = Date.now()
  const filename = `hospitality-${params.taskType}-${timestamp}.pdf`
  const filepath = path.join(uploadsDir, filename)

  // Générer le contenu du document selon le type de tâche
  let documentContent = ''

  switch (params.taskType) {
    case 'welcome-pack':
      documentContent = generateWelcomePackContent(params.context)
      break
    case 'fiche-voyageur':
      documentContent = generateFicheVoyageurContent(params.context)
      break
    case 'acces-wifi-qr':
      documentContent = generateAccesWifiQrContent(params.context)
      break
    case 'instructions-arrivee-depart':
      documentContent = generateInstructionsArriveeDepartContent(params.context)
      break
    case 'plan-localisation':
      documentContent = generatePlanLocalisationContent(params.context)
      break
    case 'pack-multi-logement':
      documentContent = generatePackMultiLogementContent(params.context)
      break
  }

  await writeFile(filepath, documentContent, 'utf-8')

  return {
    documentUrl: `/uploads/hospitality/${filename}`,
  }
}

function generateWelcomePackContent(context: Record<string, unknown>): string {
  const propertyName = String(context.propertyName || 'Votre logement')
  const guestName = String(context.guestName || 'Cher voyageur')
  const wifiPassword = String(context.wifiPassword || 'N/A')
  const checkInTime = String(context.checkInTime || '15h00')
  const checkOutTime = String(context.checkOutTime || '11h00')

  return `PDF_SIMULATION - Welcome Pack
================================================================================
Bienvenue ${guestName} !

PROPRIÉTÉ: ${propertyName}

INFORMATIONS D'ACCÈS:
- Arrivée: ${checkInTime}
- Départ: ${checkOutTime}
- Wi-Fi: ${wifiPassword}

GUIDE D'UTILISATION:
- Règles de la maison
- Contacts d'urgence
- Transports à proximité
- Recommandations locales

Généré le: ${new Date().toISOString()}
================================================================================
`
}

function generateFicheVoyageurContent(context: Record<string, unknown>): string {
  const guestName = String(context.guestName || 'Voyageur')
  const checkIn = String(context.checkIn || 'N/A')
  const checkOut = String(context.checkOut || 'N/A')
  const propertyName = String(context.propertyName || 'Logement')

  return `PDF_SIMULATION - Fiche Voyageur
================================================================================
FICHE VOYAGEUR

Nom: ${guestName}
Séjour: ${checkIn} → ${checkOut}
Logement: ${propertyName}

DÉTAILS DU SÉJOUR:
- Dates de séjour
- Nombre de voyageurs
- Informations de contact
- Préférences spéciales

Généré le: ${new Date().toISOString()}
================================================================================
`
}

function generateAccesWifiQrContent(context: Record<string, unknown>): string {
  const wifiPassword = String(context.wifiPassword || 'N/A')
  const wifiName = String(context.wifiName || 'Wi-Fi')
  const accessCode = String(context.accessCode || 'N/A')

  // QR code simple et passif (statique, pas de système de gestion)
  // Format standard WIFI pour connexion automatique
  const wifiQrData = `WIFI:T:WPA;S:${wifiName};P:${wifiPassword};;`
  
  // QR code simple pour code d'accès (texte brut)
  const accessQrData = accessCode

  return `PDF_SIMULATION - Accès & Wi-Fi (QR)
================================================================================
CODES D'ACCÈS

Wi-Fi:
- Nom réseau: ${wifiName}
- Mot de passe: ${wifiPassword}
- QR Code Wi-Fi (connexion automatique):
  [QR_CODE_IMAGE_PLACEHOLDER]
  Format: ${wifiQrData}
  Scannez pour vous connecter automatiquement

Code d'accès:
- Code: ${accessCode}
- QR Code Accès:
  [QR_CODE_IMAGE_PLACEHOLDER]
  Format: ${accessQrData}
  Scannez pour afficher le code

CARACTÉRISTIQUES:
- QR codes passifs (statiques, pas de système de gestion)
- Aucune donnée persistante complexe
- Scannez avec votre appareil photo
- Pas de réservation, pas de gestion client

Généré le: ${new Date().toISOString()}
================================================================================
`
}

function generateInstructionsArriveeDepartContent(
  context: Record<string, unknown>,
): string {
  const propertyAddress = String(context.propertyAddress || 'Adresse non fournie')
  const checkInTime = String(context.checkInTime || '15h00')
  const checkOutTime = String(context.checkOutTime || '11h00')
  const accessMethod = String(context.accessMethod || 'Clé dans boîte sécurisée')

  return `PDF_SIMULATION - Instructions Arrivée / Départ
================================================================================
INSTRUCTIONS D'ARRIVÉE

Adresse: ${propertyAddress}
Heure d'arrivée: ${checkInTime}
Méthode d'accès: ${accessMethod}

ÉTAPES D'ARRIVÉE:
1. Arrivée à l'adresse
2. Récupération des clés / code
3. Installation dans le logement
4. Vérification des équipements

INSTRUCTIONS DE DÉPART

Heure de départ: ${checkOutTime}

ÉTAPES DE DÉPART:
1. Nettoyage de base
2. Remise des clés
3. Vérification finale
4. Fermeture du logement

Généré le: ${new Date().toISOString()}
================================================================================
`
}

function generatePlanLocalisationContent(context: Record<string, unknown>): string {
  const propertyAddress = String(context.propertyAddress || 'Adresse non fournie')
  const coordinates = String(context.coordinates || 'N/A')
  const nearbyPlaces = String(context.nearbyPlaces || 'À compléter')

  return `PDF_SIMULATION - Plan & Localisation
================================================================================
PLAN & LOCALISATION

Adresse: ${propertyAddress}
Coordonnées: ${coordinates}

PLAN DU LOGEMENT:
- Vue d'ensemble
- Pièces principales
- Points d'intérêt intérieurs
- Sorties et accès

LOCALISATION:
- Carte de localisation
- Transports à proximité
- Commerces et services
- Lieux d'intérêt

À PROXIMITÉ:
${nearbyPlaces}

Généré le: ${new Date().toISOString()}
================================================================================
`
}

function generatePackMultiLogementContent(context: Record<string, unknown>): string {
  const properties = Array.isArray(context.properties)
    ? context.properties
    : [context.properties || {}]

  return `PDF_SIMULATION - Pack Multi-Logement
================================================================================
PACK MULTI-LOGEMENT

Nombre de logements: ${properties.length}

DOCUMENTS STANDARDISÉS:
- Welcome Pack standardisé
- Fiches voyageurs
- Codes d'accès centralisés
- Instructions uniformes

LOGGEMENTS:
${properties.map((p: any, i: number) => `  ${i + 1}. ${p.name || `Logement ${i + 1}`}`).join('\n')}

GESTION:
- Documents réutilisables
- Templates standardisés
- Processus uniformisés

Généré le: ${new Date().toISOString()}
================================================================================
`
}
