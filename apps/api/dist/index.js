import Fastify from 'fastify';
import { registerCommandRoutes } from './http/commandRoute.js';
import { exportPrometheusMetrics } from './observability/metrics.js';
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
const port = Number(process.env.PORT ?? 3001);
app.listen({ port, host: '0.0.0.0' })
    .then(() => {
    console.log(`API listening on port ${port}`);
})
    .catch(err => {
    app.log.error(err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map