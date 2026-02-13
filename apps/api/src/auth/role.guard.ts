import type { FastifyReply, FastifyRequest } from 'fastify'

type UserRole = 'founder' | 'admin' | 'client'

export function requireRole(allowed: UserRole[]) {
  return async function roleGuard(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    if (!request.user) {
      return reply.status(401).send({ error: 'UNAUTHORIZED' })
    }

    if (!allowed.includes(request.user.role)) {
      return reply.status(403).send({ error: 'FORBIDDEN' })
    }
  }
}
