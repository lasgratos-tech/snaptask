import type { FastifyReply, FastifyRequest } from 'fastify'
import { findApiKey } from './apiKey.store.js'

export async function requireApiKey(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const apiKey = request.headers['x-api-key']

  if (!apiKey || typeof apiKey !== 'string') {
    return reply.status(401).send({
      error: 'API_KEY_MISSING',
      message: 'Missing x-api-key header',
    })
  }

  const record = await findApiKey(apiKey)

  if (!record) {
    return reply.status(403).send({
      error: 'API_KEY_INVALID',
      message: 'Invalid or inactive API key',
    })
  }

  request.user = {
    apiKey: record.key,
    owner: record.owner,
  }
}
