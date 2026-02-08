import Fastify from 'fastify';

import { registerCommandRoutes } from './http/commandRoute.js';
import { exportPrometheusMetrics } from './observability/metrics.js';
import { registerV5 } from './v5/index.js';

const app = Fastify({ logger: true });

app.get('/health', async () => {
  return { status: 'ok' };
});

// 📊 Prometheus metrics
app.get('/metrics', async (_, reply) => {
  reply
    .header('Content-Type', 'text/plain')
    .send(exportPrometheusMetrics());
});

// Commands
await registerCommandRoutes(app);

const isV5Enabled = process.env.SNAPTASK_V5_ENABLED === 'true';
if (isV5Enabled) {
  registerV5(app);
} else {
  console.log('[API] V5 disabled');
}

const port = Number(process.env.PORT ?? 3001);

app.listen({ port, host: '0.0.0.0' })
  .then(() => {
    console.log(`API listening on port ${port}`);
  })
  .catch(err => {
    app.log.error(err);
    process.exit(1);
  });
