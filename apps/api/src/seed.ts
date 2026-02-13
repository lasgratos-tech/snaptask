import 'dotenv/config'
import prisma from './prisma/client.js'
import { createApiKey } from './auth/apiKey.store.js'

/**
 * Script de seed pour initialiser les comptes essentiels SnapTask V4
 * 
 * Comptes créés :
 * 1. founder@snaptask.internal (admin)
 * 2. admin@test.snaptask (admin)
 * 3. user@test.snaptask (user)
 * 
 * Usage: pnpm tsx src/seed.ts
 */

interface SeedAccount {
  email: string
  role: 'founder' | 'admin' | 'client'
}

const SEED_ACCOUNTS: SeedAccount[] = [
  { email: 'founder@snaptask.internal', role: 'admin' },
  { email: 'admin@test.snaptask', role: 'admin' },
  { email: 'user@test.snaptask', role: 'client' },
]

async function seed() {
  console.log('🌱 Démarrage du seed SnapTask V4...\n')

  const results: Array<{ email: string; apiKey: string; role: string; created: boolean }> = []

  for (const account of SEED_ACCOUNTS) {
    const owner = account.email.toLowerCase().trim()

    try {
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await prisma.user.findUnique({
        where: { owner },
        include: {
          apiKeys: {
            where: { revokedAt: null },
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
        },
      })

      if (existingUser && existingUser.apiKeys.length > 0) {
        // Utilisateur existe déjà avec une API key active
        const activeKey = existingUser.apiKeys[0]
        console.log(`✓ Compte existant: ${account.email} (${account.role})`)
        console.log(`  API Key: ${activeKey.key}\n`)
        results.push({
          email: account.email,
          apiKey: activeKey.key,
          role: account.role,
          created: false,
        })
      } else {
        // Créer ou mettre à jour l'utilisateur et générer une nouvelle API key
        const apiKeyRecord = await createApiKey(owner, account.role, 'test')
        console.log(`✓ Compte créé: ${account.email} (${account.role})`)
        console.log(`  API Key: ${apiKeyRecord.key}\n`)
        results.push({
          email: account.email,
          apiKey: apiKeyRecord.key,
          role: account.role,
          created: true,
        })
      }
    } catch (error) {
      console.error(`✗ Erreur lors de la création du compte ${account.email}:`, error)
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📋 RÉSUMÉ DES COMPTES')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  results.forEach((result) => {
    console.log(`${result.created ? '🆕' : '♻️'} ${result.email}`)
    console.log(`   Rôle: ${result.role}`)
    console.log(`   API Key: ${result.apiKey}`)
    console.log('')
  })

  console.log('✅ Seed terminé avec succès')
}

seed()
  .catch((error) => {
    console.error('❌ Erreur lors du seed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
