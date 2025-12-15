import Fastify from 'fastify';
import { registerCommandRoutes } from './http/commandRoute.js';
import { exportPrometheusMetrics } from './observability/metrics.js';

const app = Fastify({
  logger: true,
});

/**
 * Healthcheck (Railway / monitoring)
 */
app.get('/health', async () => {
  return { status: 'ok' };
});

/**
 * Prometheus metrics
 */
app.get('/metrics', async (_, reply) => {
  reply
    .header('Content-Type', 'text/plain')
    .send(exportPrometheusMetrics());
});

/**
 * Business routes
 */
await registerCommandRoutes(app);

/**
 * 🚨 Railway PORT (OBLIGATOIRE)
 * Railway injecte process.env.PORT
 */
const port = Number(process.env.PORT);

if (!port) {
  throw new Error('PORT environment variable is not defined');
}

try {
  await app.listen({
    port,
    host: '0.0.0.0',
  });

  app.log.info(`API listening on port ${port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
