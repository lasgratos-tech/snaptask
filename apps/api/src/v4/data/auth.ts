import prisma from '../../prisma/client.js'
import { createApiKey, findApiKey, revokeApiKey } from '../../auth/apiKey.store.js'
import crypto from 'crypto'

export interface User {
  id: string
  owner: string
  role: 'founder' | 'admin' | 'client'
  createdAt: string
}

export interface AuthResult {
  user: User
  apiKey: string
}

/**
 * Créer un nouvel utilisateur avec une API key
 */
export async function registerUser(
  email: string,
  role: 'founder' | 'admin' | 'client' = 'client',
): Promise<AuthResult> {
  const owner = email.toLowerCase().trim()

  // Vérifier si l'utilisateur existe déjà
  const existingUser = await prisma.user.findUnique({
    where: { owner },
  })

  if (existingUser) {
    throw new Error('USER_ALREADY_EXISTS')
  }

  // Créer l'utilisateur et l'API key
  const apiKeyRecord = await createApiKey(owner, role, 'test')

  const user = await prisma.user.findUnique({
    where: { owner },
  })

  if (!user) {
    throw new Error('USER_CREATION_FAILED')
  }

  return {
    user: {
      id: user.id,
      owner: user.owner,
      role: apiKeyRecord.role,
      createdAt: user.createdAt.toISOString(),
    },
    apiKey: apiKeyRecord.key,
  }
}

/**
 * Login avec API key (retourne les infos utilisateur)
 */
export async function loginWithApiKey(apiKey: string): Promise<User | null> {
  const record = await findApiKey(apiKey)
  if (!record) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { owner: record.owner },
  })

  if (!user) {
    return null
  }

  return {
    id: user.id,
    owner: user.owner,
    role: record.role,
    createdAt: user.createdAt.toISOString(),
  }
}

/**
 * Créer une nouvelle API key pour un utilisateur existant (login)
 */
export async function createSessionForUser(owner: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { owner },
  })

  if (!user) {
    throw new Error('USER_NOT_FOUND')
  }

  // Récupérer le rôle depuis une API key existante ou utiliser 'client' par défaut
  const existingKeys = await prisma.apiKey.findMany({
    where: { owner, revokedAt: null },
    take: 1,
  })

  const role = existingKeys[0]?.role || 'client'

  const apiKeyRecord = await createApiKey(owner, role, 'test')
  return apiKeyRecord.key
}

/**
 * Logout (révoquer l'API key actuelle)
 */
export async function logoutUser(owner: string, apiKey: string): Promise<boolean> {
  return revokeApiKey(owner, apiKey)
}

/**
 * Récupérer les informations de l'utilisateur actuel
 */
export async function getCurrentUser(owner: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { owner },
  })

  if (!user) {
    return null
  }

  // Récupérer le rôle depuis une API key active
  const activeKey = await prisma.apiKey.findFirst({
    where: { owner, revokedAt: null },
    orderBy: { createdAt: 'desc' },
  })

  return {
    id: user.id,
    owner: user.owner,
    role: activeKey?.role || 'client',
    createdAt: user.createdAt.toISOString(),
  }
}
