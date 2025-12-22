import type { ExecuteTaskDTO } from './tasks.types';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { executeTask } from './tasks.service';
import { taskExecutionCounter } from './tasks.metrics';
import { debitAccount } from '../../ledger/ledger.store';
import { getTaskCost } from '../../pricing/pricing.service';

export async function executeTaskController(
  request: FastifyRequest<{ Body: ExecuteTaskDTO }>,
  reply: FastifyReply
) {
  const user = request.user;

  if (!user) {
    return reply.status(401).send({ error: 'UNAUTHORIZED' });
  }

  let cost: number;

  try {
    cost = getTaskCost(request.body.taskType as any);
  } catch {
    return reply.status(400).send({
      error: 'TASK_NOT_PRICED',
      message: 'No pricing defined for this task type',
    });
  }

  try {
    // 💳 Débit dynamique selon le pricing
    debitAccount(user.owner, cost, `task:${request.body.taskType}`);
  } catch (err) {
    if (err instanceof Error && err.message === 'INSUFFICIENT_CREDITS') {
      return reply.status(402).send({
        error: 'INSUFFICIENT_CREDITS',
        requiredCredits: cost,
      });
    }
    throw err;
  }

  const result = await executeTask(request.body);

  taskExecutionCounter.inc({
    taskType: request.body.taskType,
  });

  return reply.status(200).send({
    success: true,
    costCredits: cost,
    data: result,
  });
}
