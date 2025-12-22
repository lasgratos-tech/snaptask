import type { FastifyInstance } from 'fastify';
import pg from 'pg';

const { Pool } = pg;

export async function bootstrapRoutes(app: FastifyInstance) {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 2,
    idleTimeoutMillis: 30_000,
  });

  // Nettoyage propre à l’arrêt du serveur
  app.addHook('onClose', async () => {
    await pool.end();
  });

  app.post('/_internal/bootstrap', async (request, reply) => {
    // ⚠️ Sécurité minimale : jamais en prod
    if (process.env.NODE_ENV === 'production') {
      return reply.code(404).send();
    }

    const owner = 'dev@snaptask.local';
    const apiKey = 'dev-snaptask-key';

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      await client.query(
        `
        INSERT INTO "User" ("owner")
        VALUES ($1)
        ON CONFLICT ("owner") DO NOTHING
        `,
        [owner]
      );

      await client.query(
        `
        INSERT INTO "ApiKey" ("key", "owner")
        VALUES ($1, $2)
        ON CONFLICT ("key") DO NOTHING
        `,
        [apiKey, owner]
      );

      await client.query(
        `
        INSERT INTO "LedgerAccount" ("owner", "balance", "updatedAt")
        VALUES ($1, 0, NOW())
        ON CONFLICT ("owner") DO NOTHING
        `,
        [owner]
      ); 
      // 🔧 DEV ONLY — crédit initial pour tests (A3)
      await client.query(
  `
      UPDATE "LedgerAccount"
      SET "balance" = 100
      WHERE "owner" = $1
  `,
  [owner]
);


      await client.query('COMMIT');

      return { status: 'bootstrap_ok' };
    } catch (err) {
      await client.query('ROLLBACK');
      app.log.error(err, '❌ Bootstrap failed');
      throw err;
    } finally {
      client.release();
    }
  });
}
