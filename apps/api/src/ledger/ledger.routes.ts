import type { FastifyInstance } from 'fastify';
import { listEvents } from './ledger.history';
import { requireApiKey } from '../auth/apiKey.guard';

export async function ledgerRoutes(app: FastifyInstance) {
  /**
   * 👤 Historique utilisateur (ses propres transactions)
   */
  app.get(
    '/ledger/me',
    { preHandler: requireApiKey },
    async (request) => {
      return listEvents(request.user!.owner);
    }
  );

  /**
   * 🛠️ Historique admin (toutes les transactions)
   */
  app.get('/admin/ledger', async () => {
    return listEvents();
  });
}
