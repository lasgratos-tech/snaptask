import crypto from 'crypto'
import prisma from '../prisma/client.js'
import { generateApiKey } from './apiKey.generator.js'

export interface ApiKeyRecord {
  key: string
  owner: string
  role: 'founder' | 'admin' | 'client'
  createdAt: Date
  revokedAt: Date | null
}

/**
 * 🔍 Find an active API key
 */
export async function findApiKey(
  key: string,
): Promise<ApiKeyRecord | null> {
  return prisma.apiKey.findFirst({
    where: {
      key,
      revokedAt: null,
    },
    select: {
      key: true,
      owner: true,
      role: true,
      createdAt: true,
      revokedAt: true,
    },
  })
}

/**
 * 📋 List API keys for an owner
 */
export async function listApiKeys(
  owner: string,
): Promise<ApiKeyRecord[]> {
  return prisma.apiKey.findMany({
    where: { owner },
    orderBy: { createdAt: 'desc' },
    select: {
      key: true,
      owner: true,
      role: true,
      createdAt: true,
      revokedAt: true,
    },
  })
}

/**
 * 🔐 Create a new API key for an owner
 */
export async function createApiKey(
  owner: string,
  role: 'founder' | 'admin' | 'client' = 'client',
  mode: 'test' | 'live' = 'test',
): Promise<ApiKeyRecord> {
  const key = generateApiKey(mode)

  return prisma.$transaction(async (tx) => {
    await tx.user.upsert({
      where: { owner },
      update: {},
      create: {
        id: crypto.randomUUID(),
        owner,
      },
    })

    return tx.apiKey.create({
      data: {
        key,
        owner,
        role,
      },
      select: {
        key: true,
        owner: true,
        role: true,
        createdAt: true,
        revokedAt: true,
      },
    })
  })
}

export async function countFounderKeys(): Promise<number> {
  return prisma.apiKey.count({
    where: {
      role: 'founder',
    },
  })
}

/**
 * 🚫 Revoke an API key belonging to an owner
 */
export async function revokeApiKey(
  owner: string,
  key: string,
): Promise<boolean> {
  const result = await prisma.apiKey.updateMany({
    where: {
      key,
      owner,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  })

  return result.count === 1
}
