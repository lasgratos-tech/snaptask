import type { FastifyRequest } from 'fastify'

export function getActorContext(request: FastifyRequest) {
  if (!request.user) {
    throw new Error('ACTOR_CONTEXT_MISSING')
  }

  return {
    owner: request.user.owner,
    apiKey: request.user.apiKey,
  }
}
