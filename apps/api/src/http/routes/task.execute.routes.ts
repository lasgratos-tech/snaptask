import type { FastifyInstance, FastifyReply } from 'fastify';
import crypto from 'crypto';

import { TaskExecuteInputSchema } from '../contracts/task.execute.contract';
import { getTaskPrice } from '@/modules/tasks/task.pricing';
import { executeTask } from '@/modules/tasks/task.runner';
import { authorizeAndDebit } from '@/ledger/ledger.service';
import { compensateCredit } from '@/ledger/ledger.compensation.service';
import { sendError } from '@/http/utils/error.response';

export async function taskExecuteRoutes(app: FastifyInstance) {
  app.post(
    '/v1/tasks/execute',
    async (request, reply: FastifyReply) => {
      const parsed = TaskExecuteInputSchema.safeParse(request.body);

      if (!parsed.success) {
        request.log.error(parsed.error.format());
        return sendError(reply, 'INVALID_INPUT', 400);
      }

      const { taskType, input } = parsed.data;
      const owner = request.user!.owner;
      const cost = getTaskPrice(taskType);

      try {
        // 1️⃣ DEBIT — autorisation financière
        await authorizeAndDebit({
          owner,
          amount: cost,
          reason: `TASK:${taskType.toUpperCase()}`,
        });

        // 2️⃣ EXÉCUTION IA
        const result = await executeTask(taskType, input);

        // 3️⃣ SUCCESS
        return reply.status(200).send({
          taskId: crypto.randomUUID(),
          result: result.result,
          cost,
        });
      } catch (err) {
        // 4️⃣ COMPENSATION FINANCIÈRE (A4)
        await compensateCredit({
          owner,
          amount: cost,
          reason: `REFUND:TASK:${taskType.toUpperCase()}`,
        });

        request.log.error(err, 'TASK_EXECUTION_FAILED_WITH_REFUND');

        // 5️⃣ ERREUR NORMALISÉE (A5)
        return sendError(reply, 'INTERNAL_ERROR', 500);
      }
    }
  );
}
