import 'dotenv/config'

import Fastify from 'fastify'
import cors from '@fastify/cors'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

import { apiKeyAuthMiddleware } from './auth/apiKey.middleware.js'

import { registerTaskExecuteRoute } from './http/routes/bootstrap.routes.js'

import { apiKeyAdminRoutes } from './auth/apiKey.admin.routes.js'
import { billingRoutes } from './billing/billing.routes.js'
import { ledgerRoutes } from './ledger/ledger.routes.js'

import { exportPrometheusMetrics } from './observability/metrics.js'
import { bootstrapTasks } from './modules/tasks/bootstrap.js'
import { bootstrapRoutes } from './http/routes/bootstrap.routes.js'
import { registerV4Routes } from './v4/index.js'
import { registerStripeWebhook } from './v4/webhooks/stripe.webhook.js'

/**
 * Fastify request typing (auth context)
 */
declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      apiKey: string
      owner: string
      role: 'founder' | 'admin' | 'client'
    }
    rawBody?: Buffer
  }
}

async function bootstrap() {
  const app = Fastify({
    logger: true,
  })

  /**
   * ⚠️ RAW BODY PARSER (Stripe Webhook)
   * DOIT être déclaré AVANT toute route
   */
  app.addContentTypeParser(
    'application/json',
    { parseAs: 'buffer' },
    (req, body, done) => {
      ;(req as any).rawBody = body
      try {
        done(null, JSON.parse(body.toString()))
      } catch (err) {
        done(err as Error, undefined)
      }
    },
  )

  /**
   * 🧠 TASK SYSTEM BOOTSTRAP
   * Crash early si incohérence
   */
  bootstrapTasks()

  /**
   * 🔐 INTERNAL TASK EXECUTION (DEV / SYSTEM)
   * ⚠️ Sans middleware global
   */
  

  /**
   * 🌐 CORS — nécessaire pour les routes auth publiques (frontend localhost:5173)
   */
  await app.register(cors, {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type', 'x-api-key'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })

  /**
   * ❤️ Healthcheck
   */
  app.get('/health', async () => {
    return { status: 'ok' }
  })

  /**
   * 📊 Prometheus metrics
   */
  app.get('/metrics', async (_, reply) => {
    reply
      .header('Content-Type', 'text/plain')
      .send(exportPrometheusMetrics())
  })

  /**
   * 📁 STATIC FILES — Preuves uploadées
   */
  const staticPlugin = await import('@fastify/static')
  await app.register(staticPlugin.default, {
    root: path.join(process.cwd(), 'uploads'),
    prefix: '/uploads/',
  })

  /**
   * 🔔 STRIPE WEBHOOK (SANS AUTH API KEY)
   * ⚠️ DOIT être monté AVANT le bloc protégé
   * Stripe envoie les webhooks avec signature, pas API key
   */
  await registerStripeWebhook(app)

  /**
   * 🔐 AUTHENTICATION PUBLIC ROUTES (SANS AUTH API KEY)
   * Login et Register doivent être accessibles sans authentification
   */
  app.post('/v4/auth/register', async (request, reply) => {
    const body = request.body as {
      email?: unknown
      role?: unknown
    }

    const email = typeof body.email === 'string' ? body.email.trim() : ''
    const role =
      body.role === 'founder' || body.role === 'admin' || body.role === 'client'
        ? (body.role as 'founder' | 'admin' | 'client')
        : 'client'

    if (!email || !email.includes('@')) {
      return reply.code(400).send({ error: 'INVALID_EMAIL' })
    }

    try {
      const { registerUser } = await import('./v4/data/auth.js')
      const { createAuditLog } = await import('./v4/data/auditLog.js')

      const result = await registerUser(email, role)

      // Audit log pour l'enregistrement
      await createAuditLog(
        'USER_REGISTERED',
        'taskExecution',
        result.user.id,
        'system',
        undefined,
        {
          userId: result.user.id,
          owner: result.user.owner,
          role: result.user.role,
        },
      )

      return reply.send({
        user: {
          id: result.user.id,
          owner: result.user.owner,
          role: result.user.role,
        },
        apiKey: result.apiKey,
      })
    } catch (err: any) {
      if (err.message === 'USER_ALREADY_EXISTS') {
        return reply.code(409).send({ error: 'USER_ALREADY_EXISTS' })
      }
      app.log.error({ err, email }, 'REGISTRATION_FAILED')
      return reply.code(500).send({ error: 'REGISTRATION_FAILED' })
    }
  })

  app.post('/v4/auth/login', async (request, reply) => {
    const body = request.body as {
      apiKey?: unknown
      email?: unknown
    }

    const { loginWithApiKey, createSessionForUser } = await import('./v4/data/auth.js')
    const { createAuditLog } = await import('./v4/data/auditLog.js')

    // Cas 1: Login avec API key existante
    if (body.apiKey && typeof body.apiKey === 'string') {
      const user = await loginWithApiKey(body.apiKey)
      if (!user) {
        return reply.code(401).send({ error: 'INVALID_API_KEY' })
      }

      // Audit log pour le login
      await createAuditLog(
        'USER_LOGIN',
        'taskExecution',
        user.id,
        'user',
        user.owner,
        {
          userId: user.id,
          owner: user.owner,
          role: user.role,
          method: 'api_key',
        },
      )

      return reply.send({
        user: {
          id: user.id,
          owner: user.owner,
          role: user.role,
        },
        apiKey: body.apiKey,
      })
    }

    // Cas 2: Login avec email (création d'une nouvelle API key)
    if (body.email && typeof body.email === 'string') {
      const email = body.email.trim()
      if (!email || !email.includes('@')) {
        return reply.code(400).send({ error: 'INVALID_EMAIL' })
      }

      try {
        const apiKey = await createSessionForUser(email.toLowerCase())
        const user = await loginWithApiKey(apiKey)

        if (!user) {
          return reply.code(500).send({ error: 'LOGIN_FAILED' })
        }

        // Audit log pour le login
        await createAuditLog(
          'USER_LOGIN',
          'taskExecution',
          user.id,
          'user',
          user.owner,
          {
            userId: user.id,
            owner: user.owner,
            role: user.role,
            method: 'email',
          },
        )

        return reply.send({
          user: {
            id: user.id,
            owner: user.owner,
            role: user.role,
          },
          apiKey,
        })
      } catch (err: any) {
        if (err.message === 'USER_NOT_FOUND') {
          return reply.code(404).send({ error: 'USER_NOT_FOUND' })
        }
        app.log.error({ err, email }, 'LOGIN_FAILED')
        return reply.code(500).send({ error: 'LOGIN_FAILED' })
      }
    }

    return reply.code(400).send({ error: 'MISSING_CREDENTIALS' })
  })

  /**
   * 🔐 AUTH MINIMAL — endpoints /auth/* pour déblocage tests V4 (local)
   * Réutilise la logique v4/data/auth, réponse { email, role, apiKey }
   */
  const roleForFront = (r: string) => (r === 'client' ? 'user' : r)

  app.post('/auth/register', async (request, reply) => {
    const body = request.body as { email?: unknown }
    const email = typeof body?.email === 'string' ? body.email.trim() : ''
    if (!email || !email.includes('@')) {
      return reply.code(400).send({ error: 'INVALID_EMAIL' })
    }
    try {
      const { registerUser } = await import('./v4/data/auth.js')
      const result = await registerUser(email.toLowerCase(), 'client')
      return reply.send({
        email: result.user.owner,
        role: roleForFront(result.user.role),
        apiKey: result.apiKey,
      })
    } catch (err: any) {
      if (err.message === 'USER_ALREADY_EXISTS') {
        return reply.code(409).send({ error: 'USER_ALREADY_EXISTS' })
      }
      app.log.error({ err, email }, 'REGISTRATION_FAILED')
      return reply.code(500).send({ error: 'REGISTRATION_FAILED' })
    }
  })

  app.post('/auth/login', async (request, reply) => {
    const body = request.body as { email?: unknown }
    const email = typeof body?.email === 'string' ? body.email.trim() : ''
    if (!email || !email.includes('@')) {
      return reply.code(400).send({ error: 'INVALID_EMAIL' })
    }
    try {
      const { createSessionForUser } = await import('./v4/data/auth.js')
      const { loginWithApiKey } = await import('./v4/data/auth.js')
      const apiKey = await createSessionForUser(email.toLowerCase())
      const user = await loginWithApiKey(apiKey)
      if (!user) {
        return reply.code(500).send({ error: 'LOGIN_FAILED' })
      }
      return reply.send({
        email: user.owner,
        role: roleForFront(user.role),
        apiKey,
      })
    } catch (err: any) {
      if (err.message === 'USER_NOT_FOUND') {
        return reply.code(404).send({ error: 'USER_NOT_FOUND' })
      }
      app.log.error({ err, email }, 'LOGIN_FAILED')
      return reply.code(500).send({ error: 'LOGIN_FAILED' })
    }
  })

  app.post('/auth/login-api-key', async (request, reply) => {
    const body = request.body as { apiKey?: unknown }
    const apiKey = typeof body?.apiKey === 'string' ? body.apiKey.trim() : ''
    if (!apiKey) {
      return reply.code(400).send({ error: 'MISSING_API_KEY' })
    }
    const { loginWithApiKey } = await import('./v4/data/auth.js')
    const user = await loginWithApiKey(apiKey)
    if (!user) {
      return reply.code(401).send({ error: 'INVALID_API_KEY' })
    }
    return reply.send({
      email: user.owner,
      role: roleForFront(user.role),
    })
  })

  /**
   * 🔐 AUTHENTICATED API (API KEY REQUIRED)
   */
  app.register(async (protectedApp) => {
    await protectedApp.register(cors, {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Authorization', 'Content-Type', 'x-api-key'],
      preflightContinue: false,
      optionsSuccessStatus: 204,
    })

    protectedApp.addHook('preHandler', apiKeyAuthMiddleware)

    await protectedApp.register(apiKeyAdminRoutes)
    await protectedApp.register(billingRoutes)
    await protectedApp.register(ledgerRoutes)

    /**
     * ✅ PRODUIT : routes publiques sécurisées
     * /v1/tasks/text-summarize
     */
    await bootstrapRoutes(protectedApp)
    await registerV4Routes(protectedApp)
  })

  /**
   * 🚀 SERVER START (ONE AND ONLY ONE)
   */
  const port = Number(process.env.PORT) || 3000
  await app.listen({
    port,
    host: '0.0.0.0',
  })

  app.log.info(`API listening on port ${port}`)
}

/**
 * Global bootstrap error handling
 */
bootstrap().catch((err) => {
  console.error('❌ FATAL BOOTSTRAP ERROR')
  console.error(err instanceof Error ? err.stack : err)
  process.exit(1)
})
