import type { FastifyReply, FastifyRequest } from 'fastify';
import { checkRateLimit } from './rateLimit.store';

export async function requireRateLimit(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const user = request.user;

  if (!user) {
    return reply.status(401).send({
      error: 'UNAUTHORIZED',
    });
  }

  const key = user.apiKey;
  const result = checkRateLimit(key);

  if (!result.allowed) {
    return reply.status(429).send({
      error: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests',
      resetAt: result.resetAt,
    });
  }

  reply.header('X-RateLimit-Remaining', String(result.remaining));
}
