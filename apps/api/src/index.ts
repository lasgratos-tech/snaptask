import 'dotenv/config';
import Fastify from 'fastify';

import { apiKeyAuthMiddleware } from './auth/apiKey.middleware';

import { bootstrapRoutes } from './http/routes/bootstrap.routes';
import { taskExecuteRoutes } from './http/routes/task.execute.routes';
import { tasksRoutes } from './modules/tasks/tasks.routes';
import { apiKeyAdminRoutes } from './auth/apiKey.admin.routes';
import { billingRoutes } from './billing/billing.routes';
import { ledgerRoutes } from './ledger/ledger.routes';

import { exportPrometheusMetrics } from './observability/metrics';

/**
 * Fastify request typing (auth context)
 */
declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      apiKey: string;
      owner: string;
    };
    rawBody?: Buffer;
  }
}

async function bootstrap() {
  const app = Fastify({
    logger: true,
  });

  /**
   * ⚠️ RAW BODY PARSER (Stripe Webhook)
   * DOIT être enregistré AVANT les routes
   */
  app.addContentTypeParser(
    'application/json',
    { parseAs: 'buffer' },
    (req, body, done) => {
      (req as any).rawBody = body;
      try {
        done(null, JSON.parse(body.toString()));
      } catch (err) {
        done(err as Error, undefined);
      }
    }
  );

  /**
   * 🔐 INTERNAL BOOTSTRAP (DEV ONLY)
   * AUCUNE auth, jamais exposé en prod
   */
  await app.register(bootstrapRoutes);

  /**
   * ❤️ Healthcheck (Railway / monitoring)
   * PUBLIC
   */
  app.get('/health', async () => {
    return { status: 'ok' };
  });

  /**
   * 📊 Prometheus metrics
   * PUBLIC (ou IP-whitelist plus tard)
   */
  app.get('/metrics', async (_, reply) => {
    reply
      .header('Content-Type', 'text/plain')
      .send(exportPrometheusMetrics());
  });

  /**
   * 🔐 AUTHENTICATED ROUTES SCOPE
   * (API Key required)
   */
  app.register(async (protectedApp) => {
    protectedApp.addHook('preHandler', apiKeyAuthMiddleware);

    await protectedApp.register(apiKeyAdminRoutes); // admin API keys
    
    await protectedApp.register(billingRoutes);     // Stripe checkout + webhook
    await protectedApp.register(ledgerRoutes);      // Ledger history
    await protectedApp.register(taskExecuteRoutes);
  });

  /**
   * 🚀 PORT handling
   */
  const port = Number(process.env.PORT) || 3000;

  await app.listen({
    port,
    host: '0.0.0.0',
  });

  app.log.info(`API listening on port ${port}`);
}

/**
 * Global bootstrap error handling
 */
bootstrap().catch((err) => {
  console.error('❌ FATAL BOOTSTRAP ERROR');
  console.error(err instanceof Error ? err.stack : err);
  process.exit(1);
});
