import type { FastifyReply, FastifyRequest } from 'fastify';

export type UserContext = {
  id: string;
};

export const requireUser = (
  request: FastifyRequest,
  reply: FastifyReply,
): UserContext | null => {
  const id = request.headers['x-user-id'];
  if (typeof id !== 'string' || !id.trim()) {
    reply.code(401).send({ error: 'UNAUTHORIZED' });
    return null;
  }
  const user = { id: id.trim() };
  request.user = user;
  return user;
};

declare module 'fastify' {
  interface FastifyRequest {
    user?: UserContext;
  }
}
