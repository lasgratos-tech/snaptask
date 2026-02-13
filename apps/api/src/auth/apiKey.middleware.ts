import type { FastifyRequest, FastifyReply } from 'fastify'
import { countFounderKeys, findApiKey } from './apiKey.store.js'
import prisma from '../prisma/client.js'

export async function apiKeyAuthMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const rawKey =
    request.headers['x-api-key'] ??
    request.headers.authorization?.replace('Bearer ', '')

  const apiKey = Array.isArray(rawKey) ? rawKey[0] : rawKey

  if (!apiKey) {
    return reply.status(401).send({
      error: 'API_KEY_MISSING',
      message: 'Missing x-api-key header',
    })
  }

  let existingKeys: number | null = null
  if (process.env.NODE_ENV === 'development') {
    existingKeys = await prisma.apiKey.count()
    const adminKeyPresent = Boolean(process.env.ADMIN_API_KEY)
    console.info(
      `[admin-auth][dev] NODE_ENV=development adminKeyPresent=${adminKeyPresent} apiKeys=${existingKeys}`,
    )
  }

  if (process.env.NODE_ENV === 'development') {
    const isBootstrapRoute =
      request.method === 'POST' && request.url === '/admin/bootstrap/founder'
    if (
      isBootstrapRoute &&
      process.env.FOUNDER_BOOTSTRAP_KEY &&
      apiKey === process.env.FOUNDER_BOOTSTRAP_KEY
    ) {
      const founderCount = await countFounderKeys()
      if (founderCount === 0) {
        request.user = {
          apiKey,
          owner: 'founder',
          role: 'founder',
        }
        return
      }
    }
  }

  const record = await findApiKey(apiKey)

  if (!record) {
    return reply.status(401).send({
      error: 'INVALID_API_KEY',
      message: 'Invalid or revoked API key',
    })
  }

  request.user = {
    apiKey: record.key,
    owner: record.owner,
    role: record.role,
  }
}
