import type { FastifyInstance } from "fastify";
import {
  createApiKey,
  countFounderKeys,
  listApiKeys,
  revokeApiKey,
} from "./apiKey.store.js";
import { requireRole } from './role.guard.js'

export async function apiKeyAdminRoutes(app: FastifyInstance) {
  /**
   * 🔐 FOUNDER BOOTSTRAP — Créer la première clé founder (dev only)
   */
  app.post(
    "/admin/bootstrap/founder",
    { preHandler: requireRole(['founder']) },
    async (request, reply) => {
      const founderCount = await countFounderKeys()
      if (founderCount > 0) {
        return reply.status(403).send({ error: "BOOTSTRAP_DISABLED" })
      }

      const apiKey = await createApiKey('founder', 'founder', 'test')

      console.info(`[admin][bootstrap][founder] owner=founder`)

      return reply.send({
        apiKey,
        role: 'founder',
      })
    },
  )

  /**
   * 🔐 ADMIN — Générer une nouvelle API key
   * Usage interne uniquement (protégé par apiKeyAuthMiddleware)
   */
  app.post(
    "/admin/api-keys",
    { preHandler: requireRole(['founder', 'admin']) },
    async (request, reply) => {
    if (!request.user) {
      return reply.status(401).send({ error: "UNAUTHORIZED" });
    }

    const body = request.body as {
      mode?: "test" | "live";
      role?: 'founder' | 'admin' | 'client'
    };

    const mode = body?.mode ?? "test";
    const owner = request.user.owner;
    const role = body?.role ?? 'client'

    if (request.user.role === 'admin' && role !== 'client') {
      return reply.status(403).send({ error: "FORBIDDEN" });
    }
    if (role === 'founder' && request.user.role !== 'founder') {
      return reply.status(403).send({ error: "FORBIDDEN" });
    }

    const apiKey = await createApiKey(owner, role, mode);

    console.info(
      `[admin][api-keys][create] owner=${owner} mode=${mode} role=${role}`,
    )

    return reply.send({
      apiKey,
      mode,
      role,
    });
  });

  /**
   * 🔐 ADMIN — Lister les API keys d’un owner
   */
  app.get(
    "/admin/api-keys",
    { preHandler: requireRole(['founder', 'admin']) },
    async (request, reply) => {
    if (!request.user) {
      return reply.status(401).send({ error: "UNAUTHORIZED" });
    }

    console.info(`[admin][api-keys][list] owner=${request.user.owner}`)
    return listApiKeys(request.user.owner);
  });

  /**
   * 🔐 ADMIN — Révoquer une API key
   */
  app.delete(
    "/admin/api-keys/:key",
    { preHandler: requireRole(['founder', 'admin']) },
    async (request, reply) => {
    if (!request.user) {
      return reply.status(401).send({ error: "UNAUTHORIZED" });
    }

    const { key } = request.params as { key: string };

    const revoked = await revokeApiKey(request.user.owner, key);

    if (!revoked) {
      return reply.status(404).send({ error: "API_KEY_NOT_FOUND" });
    }

    console.info(
      `[admin][api-keys][revoke] owner=${request.user.owner} key=${key}`,
    )
    return reply.send({ success: true });
  });
}
