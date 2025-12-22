import type { FastifyReply } from 'fastify';
import type { ErrorCode } from '../contracts/error.contract';

export function sendError(
  reply: FastifyReply,
  error: ErrorCode,
  statusCode = 400,
  message?: string
) {
  return reply.status(statusCode).send({
    error,
    message,
  });
}
