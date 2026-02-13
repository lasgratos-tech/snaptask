import type { FastifyInstance } from 'fastify'

import {
  catalogueRoute,
  createExecutionRoute,
  getExecutionRoute,
  getPaymentRoute,
  getReceiptRoute,
  taskDefinitionRoute,
  authorizePaymentRoute,
  downloadReceiptRoute,
} from './index.js'
import { getAuditLogsRoute, getAuditLogsByExecutionRoute } from './routes/audit.js'
import { runOpenAICvProfessional } from '../providers/openai/openai.client.js'
import { taskDefinitions } from './data/taskDefinitions.js'
import { createExecutionRequest, getExecutionRequestById } from './data/executionRequests.js'
import { createPaymentAuthorization } from './data/paymentAuthorizations.js'
import {
  executeExecutionRequest,
  getExecutionResults,
  getReceiptById,
} from './data/executionEngine.js'
import {
  getExecutionsWaitingValidation,
  getExecutionById,
  validateExecution,
  rejectExecution,
  uploadProof,
} from './data/taskExecutions.js'
import { saveProofFile, isValidFileType } from './data/proofStorage.js'
import { requiresHumanValidation } from './data/taskMetadata.js'
import { createAuditLog, getAllAuditLogs, getAuditLogsByTaskExecutionId } from './data/auditLog.js'
import { requireReviewer, requireOps, requireAdmin, checkCanValidate, checkCanAccessAudit, checkCanUploadProof } from './guards/role.guard.js'
import { requirePermission, requireAnyPermission } from './guards/rbac.guard.js'
import multipart from '@fastify/multipart'

export async function registerV4Routes(app: FastifyInstance) {
  await app.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
  })

  const notImplemented = () => ({ error: 'NOT_IMPLEMENTED' })

  app.get(catalogueRoute.path, async () => notImplemented())
  app.get(taskDefinitionRoute.path, async (request, reply) => {
    const params = request.params as { taskId: string; version: string }
    const match = taskDefinitions.find(
      (item) => item.taskId === params.taskId && item.version === params.version,
    )
    if (!match) {
      return reply.code(404).send({ error: 'TASK_NOT_FOUND' })
    }
    return reply.send({
      inputSchema: match.inputSchema,
      outputFormat: match.outputFormat,
      category: match.category,
      supportedLocales: match.supportedLocales,
      supportedCurrencies: match.supportedCurrencies,
      pricing: match.pricing,
    })
  })
  app.post(createExecutionRoute.path, async (request, reply) => {
    const body = request.body as {
      locale: { code: 'EN' | 'FR' | 'NO' | 'ES' | 'AR'; direction: 'LTR' | 'RTL' }
      currency: string
      tasks: Array<{ taskId: string; version: string; input: Record<string, unknown> }>
    }

    if (!body?.tasks || !Array.isArray(body.tasks) || body.tasks.length === 0) {
      return reply.code(400).send({ error: 'INVALID_INPUT' })
    }

    for (const task of body.tasks) {
      const def = taskDefinitions.find(
        (item) => item.taskId === task.taskId && item.version === task.version,
      )
      if (!def) {
        return reply.code(404).send({ error: 'TASK_NOT_FOUND' })
      }
      const schema = def.inputSchema as { requiredKeys?: string[] }
      if (!task.input || typeof task.input !== 'object') {
        return reply.code(400).send({ error: 'INVALID_INPUT' })
      }
      const requiredKeys = Array.isArray(schema.requiredKeys) ? schema.requiredKeys : []
      for (const key of requiredKeys) {
        if (!(key in task.input)) {
          return reply.code(400).send({ error: 'INVALID_INPUT' })
        }
      }
    }

    const record = createExecutionRequest({
      locale: body.locale,
      currency: body.currency,
      tasks: body.tasks,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    })

    try {
      const user = (request as any).user
      createAuditLog(
        'TASK_EXECUTION_CREATED',
        'taskExecution',
        record.executionRequestId,
        'user',
        user?.owner,
        {
          taskIds: body.tasks.map((t) => t.taskId),
          locale: body.locale,
          currency: body.currency,
        },
      )
    } catch (err) {
      console.error('Audit log failed:', err)
    }

    return reply.send({
      executionRequestId: record.executionRequestId,
      status: record.status,
    })
  })
  app.get(getExecutionRoute.path, async (request, reply) => {
    const params = request.params as { executionRequestId: string }
    const executionRequest = getExecutionRequestById(params.executionRequestId)
    if (!executionRequest) {
      return reply.code(404).send({ error: 'EXECUTION_NOT_FOUND' })
    }
    const taskResults = getExecutionResults(params.executionRequestId)
    return reply.send({
      executionRequestId: executionRequest.executionRequestId,
      status: executionRequest.status,
      taskResults,
    })
  })
  app.post(authorizePaymentRoute.path, async (request, reply) => {
    const body = request.body as { executionRequestId: string; currency?: string }
    if (!body?.executionRequestId) {
      return reply.code(400).send({ error: 'INVALID_INPUT' })
    }

    const executionRequest = getExecutionRequestById(body.executionRequestId)
    if (!executionRequest) {
      return reply.code(404).send({ error: 'EXECUTION_NOT_FOUND' })
    }

    const currency = body.currency ?? executionRequest.currency
    let total = 0

    for (const task of executionRequest.tasks) {
      const def = taskDefinitions.find(
        (item) => item.taskId === task.taskId && item.version === task.version,
      )
      if (!def) {
        return reply.code(404).send({ error: 'TASK_NOT_FOUND' })
      }
      if (def.pricing.currency !== currency) {
        return reply.code(400).send({ error: 'CURRENCY_MISMATCH' })
      }
      total += def.pricing.amount
    }

    const payment = createPaymentAuthorization({
      executionRequestId: executionRequest.executionRequestId,
      amount: { amount: total, currency },
      status: 'AUTHORIZED',
    })

    const { taskResults } = executeExecutionRequest(executionRequest)
    const anyFailed = taskResults.some((item) => item.status === 'FAILED')
    executionRequest.status = anyFailed ? 'FAILED' : 'COMPLETED'

    return reply.send({
      paymentRef: payment.paymentRef,
      status: payment.status,
    })
  })
  app.get(getPaymentRoute.path, async () => notImplemented())
  app.get(getReceiptRoute.path, async (request, reply) => {
    const params = request.params as { receiptRef: string }
    const receipt = getReceiptById(params.receiptRef)
    if (!receipt) {
      return reply.code(404).send({ error: 'RECEIPT_NOT_FOUND' })
    }
    return reply.send(receipt)
  })
  app.get(downloadReceiptRoute.path, async (request, reply) => {
    const params = request.params as { receiptRef: string }
    const receipt = getReceiptById(params.receiptRef)
    if (!receipt || !receipt.outputRef) {
      return reply.code(404).send({ error: 'RECEIPT_NOT_FOUND' })
    }
    return reply.send({ outputRef: receipt.outputRef })
  })

  /**
   * 🧾 CV — génération simple (MVP)
   *
   * POST /v4/cv/generate
   *
   * Body:
   * {
   *   profileText: string;   // texte libre descriptif du profil
   *   targetRole: string;    // rôle / poste cible
   *   language?: 'fr' | 'en' // défaut: 'fr'
   * }
   *
   * Réponses:
   *  - 200: { cv: string }
   *  - 400: { error: 'INVALID_INPUT' }
   *  - 500: { error: 'CV_GENERATION_FAILED' }
   */
  app.post('/v4/cv/generate', async (request, reply) => {
    const body = request.body as {
      profileText?: unknown
      targetRole?: unknown
      language?: unknown
    }

    const profileText =
      typeof body?.profileText === 'string' ? body.profileText.trim() : ''
    const targetRole =
      typeof body?.targetRole === 'string' ? body.targetRole.trim() : ''
    const language =
      body?.language === 'en' || body?.language === 'fr' ? (body.language as 'fr' | 'en') : 'fr'

    if (!profileText || !targetRole) {
      return reply.code(400).send({ error: 'INVALID_INPUT' })
    }

    try {
      const result = await runOpenAICvProfessional({
        profileText,
        targetRole,
        language,
      })

      return reply.send({ cv: result.output })
    } catch (err) {
      request.log.error({ err }, 'CV_GENERATION_FAILED')
      return reply.code(500).send({ error: 'CV_GENERATION_FAILED' })
    }
  })

  /**
   * 📄 CV Premium — Génération avec Task Engine
   *
   * POST /v4/tasks/cv-standard/execute
   * POST /v4/tasks/cv-expert/execute
   * POST /v4/tasks/cv-executive/execute
   *
   * Body:
   * {
   *   profileText: string;
   *   targetRole: string;
   *   language?: 'fr' | 'en'
   * }
   */
  const cvTaskRoutes = [
    { taskId: 'cv-standard', cvType: 'standard' as const },
    { taskId: 'cv-expert', cvType: 'expert' as const },
    { taskId: 'cv-executive', cvType: 'executive' as const },
  ]

  for (const { taskId, cvType } of cvTaskRoutes) {
    app.post(`/v4/tasks/${taskId}/execute`, async (request, reply) => {
      const user = (request as any).user
      if (!user) {
        return reply.code(401).send({ error: 'UNAUTHORIZED' })
      }

      const body = request.body as {
        profileText?: unknown
        targetRole?: unknown
        language?: unknown
      }

      const profileText =
        typeof body?.profileText === 'string' ? body.profileText.trim() : ''
      const targetRole =
        typeof body?.targetRole === 'string' ? body.targetRole.trim() : ''
      const language =
        body?.language === 'en' || body?.language === 'fr' ? (body.language as 'fr' | 'en') : 'fr'

      if (!profileText || !targetRole) {
        return reply.code(400).send({ error: 'INVALID_INPUT' })
      }

      try {
        const { generateCv } = await import('./services/cv.service.js')
        const { createTaskExecution, updateExecutionDeliverable, updateExecutionProof } = await import('./data/taskExecutions.js')
        const { runTaskExecution } = await import('./engine/taskEngine.js')
        const { getTaskDefinition } = await import('./data/taskDefinitions.js')
        const { createAuditLog } = await import('./data/auditLog.js')

        // 1. Créer l'exécution
        const execution = createTaskExecution({
          taskId,
          userId: user.owner,
          status: 'PENDING',
        })

        // 2. Audit création
        await createAuditLog(
          'TASK_EXECUTION_CREATED',
          'taskExecution',
          execution.id,
          'user',
          user.owner,
          {
            taskId,
            cvType,
          },
        )

        // 3. Générer le CV avec PDF
        const cvResult = await generateCv({
          profileText,
          targetRole,
          language,
          cvType,
        })

        // 4. Mettre à jour l'exécution avec le livrable et la preuve
        updateExecutionDeliverable(execution.id, cvResult.pdfUrl)
        updateExecutionProof(execution.id, cvResult.pdfUrl)

        // 5. Exécuter le Task Engine pour gérer les transitions
        const definition = getTaskDefinition(taskId, 'v4.0')
        if (definition) {
          await runTaskExecution(execution.id)
        }

        // 6. Récupérer l'exécution mise à jour
        const { getExecutionById } = await import('./data/taskExecutions.js')
        const updatedExecution = getExecutionById(execution.id)

        return reply.send({
          executionId: execution.id,
          status: updatedExecution?.status || 'COMPLETED',
          deliverableUrl: cvResult.pdfUrl,
          proofUrl: cvResult.pdfUrl,
          cvText: cvResult.cvText,
          pages: cvResult.pages,
          model: cvResult.model,
        })
      } catch (err) {
        request.log.error({ err, taskId, cvType }, 'CV_TASK_EXECUTION_FAILED')
        return reply.code(500).send({ error: 'CV_TASK_EXECUTION_FAILED' })
      }
    })
  }

  /**
   * 📄 Lettres Professionnelles — Génération avec Task Engine
   *
   * POST /v4/tasks/lettre-avocat/execute
   * POST /v4/tasks/lettre-banque/execute
   * POST /v4/tasks/lettre-rh/execute
   * POST /v4/tasks/lettre-business/execute
   *
   * Body:
   * {
   *   context: string;
   *   recipient?: string;
   *   language?: 'fr' | 'en'
   * }
   */
  const letterTaskRoutes = [
    { taskId: 'lettre-avocat', letterType: 'avocat' as const },
    { taskId: 'lettre-banque', letterType: 'banque' as const },
    { taskId: 'lettre-rh', letterType: 'rh' as const },
    { taskId: 'lettre-business', letterType: 'business' as const },
  ]

  /**
   * 🏠 Airbnb / Immobilier — Génération avec Task Engine
   *
   * POST /v4/tasks/airbnb-etat-lieux/execute
   * POST /v4/tasks/airbnb-description/execute
   *
   * Body:
   * {
   *   context: string;
   * }
   */
  const airbnbTaskRoutes = [
    { taskId: 'airbnb-etat-lieux' },
    { taskId: 'airbnb-description' },
  ]

  for (const { taskId, letterType } of letterTaskRoutes) {
    app.post(`/v4/tasks/${taskId}/execute`, async (request, reply) => {
      const user = (request as any).user
      if (!user) {
        return reply.code(401).send({ error: 'UNAUTHORIZED' })
      }

      const body = request.body as {
        context?: unknown
        recipient?: unknown
        language?: unknown
      }

      const context = typeof body?.context === 'string' ? body.context.trim() : ''
      const recipient = typeof body?.recipient === 'string' ? body.recipient.trim() : undefined
      const language =
        body?.language === 'en' || body?.language === 'fr' ? (body.language as 'fr' | 'en') : 'fr'

      if (!context) {
        return reply.code(400).send({ error: 'INVALID_INPUT' })
      }

      try {
        const { generateLetter } = await import('./services/letter.service.js')
        const { createTaskExecution, updateExecutionDeliverable, updateExecutionProof } = await import('./data/taskExecutions.js')
        const { runTaskExecution } = await import('./engine/taskEngine.js')
        const { getTaskDefinition } = await import('./data/taskDefinitions.js')
        const { createAuditLog } = await import('./data/auditLog.js')

        // 1. Créer l'exécution
        const execution = createTaskExecution({
          taskId,
          userId: user.owner,
          status: 'PENDING',
        })

        // 2. Audit création
        await createAuditLog(
          'TASK_EXECUTION_CREATED',
          'taskExecution',
          execution.id,
          'user',
          user.owner,
          {
            taskId,
            letterType,
          },
        )

        // 3. Générer la lettre avec document PDF/DOCX
        const letterResult = await generateLetter({
          context,
          recipient,
          language,
          letterType,
        })

        // 4. Mettre à jour l'exécution avec le livrable et la preuve
        updateExecutionDeliverable(execution.id, letterResult.documentUrl)
        updateExecutionProof(execution.id, letterResult.documentUrl)

        // 5. Exécuter le Task Engine pour gérer les transitions
        const definition = getTaskDefinition(taskId, 'v4.0')
        if (definition) {
          await runTaskExecution(execution.id)
        }

        // 6. Récupérer l'exécution mise à jour
        const { getExecutionById } = await import('./data/taskExecutions.js')
        const updatedExecution = getExecutionById(execution.id)

        return reply.send({
          executionId: execution.id,
          status: updatedExecution?.status || 'COMPLETED',
          deliverableUrl: letterResult.documentUrl,
          proofUrl: letterResult.documentUrl,
          letterText: letterResult.letterText,
          format: letterResult.format,
        })
      } catch (err) {
        request.log.error({ err, taskId, letterType }, 'LETTER_TASK_EXECUTION_FAILED')
        return reply.code(500).send({ error: 'LETTER_TASK_EXECUTION_FAILED' })
      }
    })
  }

  /**
   * 🏠 Airbnb / Hospitality — Génération de documents
   *
   * POST /v4/tasks/airbnb-welcome-pack/execute
   * POST /v4/tasks/airbnb-fiche-voyageur/execute
   * POST /v4/tasks/airbnb-acces-wifi-qr/execute
   * POST /v4/tasks/airbnb-instructions-arrivee-depart/execute
   * POST /v4/tasks/airbnb-plan-localisation/execute
   * POST /v4/tasks/airbnb-pack-multi-logement/execute
   *
   * Body:
   * {
   *   context: Record<string, unknown>
   * }
   */
  const hospitalityTaskRoutes = [
    { taskId: 'airbnb-welcome-pack', taskType: 'welcome-pack' as const },
    { taskId: 'airbnb-fiche-voyageur', taskType: 'fiche-voyageur' as const },
    { taskId: 'airbnb-acces-wifi-qr', taskType: 'acces-wifi-qr' as const },
    { taskId: 'airbnb-instructions-arrivee-depart', taskType: 'instructions-arrivee-depart' as const },
    { taskId: 'airbnb-plan-localisation', taskType: 'plan-localisation' as const },
    { taskId: 'airbnb-pack-multi-logement', taskType: 'pack-multi-logement' as const },
  ]

  for (const { taskId, taskType } of hospitalityTaskRoutes) {
    app.post(`/v4/tasks/${taskId}/execute`, async (request, reply) => {
      const user = (request as any).user
      if (!user) {
        return reply.code(401).send({ error: 'UNAUTHORIZED' })
      }

      const body = request.body as {
        context?: unknown
      }

      const context = typeof body?.context === 'object' && body.context !== null
        ? (body.context as Record<string, unknown>)
        : {}

      try {
        const { generateHospitalityDocument } = await import('./services/hospitality.service.js')
        const { createTaskExecution, updateExecutionDeliverable } = await import('./data/taskExecutions.js')
        const { runTaskExecution } = await import('./engine/taskEngine.js')
        const { getTaskDefinition } = await import('./data/taskDefinitions.js')
        const { createAuditLog } = await import('./data/auditLog.js')

        // 1. Créer l'exécution
        const execution = createTaskExecution({
          taskId,
          userId: user.owner,
          status: 'PENDING',
        })

        // 2. Audit création
        await createAuditLog(
          'TASK_EXECUTION_CREATED',
          'taskExecution',
          execution.id,
          'user',
          user.owner,
          {
            taskId,
            taskType,
          },
        )

        // 3. Générer le document PDF
        const hospitalityResult = await generateHospitalityDocument({
          taskType,
          context,
        })

        // 4. Audit log spécifique pour la génération du document
        await createAuditLog(
          'AIRBNB_DOCUMENT_GENERATED',
          'taskExecution',
          execution.id,
          'system',
          undefined,
          {
            taskId,
            taskType,
            documentUrl: hospitalityResult.documentUrl,
            hasQrCode: taskType === 'acces-wifi-qr',
          },
        )

        // 5. Mettre à jour l'exécution avec le livrable
        updateExecutionDeliverable(execution.id, hospitalityResult.documentUrl)

        // 6. Exécuter le Task Engine pour gérer les transitions
        const definition = getTaskDefinition(taskId, 'v4.0')
        if (definition) {
          await runTaskExecution(execution.id)
        }

        // 7. Récupérer l'exécution mise à jour
        const { getExecutionById } = await import('./data/taskExecutions.js')
        const updatedExecution = getExecutionById(execution.id)

        return reply.send({
          executionId: execution.id,
          status: updatedExecution?.status || 'COMPLETED',
          deliverableUrl: hospitalityResult.documentUrl,
        })
      } catch (err) {
        request.log.error({ err, taskId, taskType }, 'HOSPITALITY_TASK_EXECUTION_FAILED')
        return reply.code(500).send({ error: 'HOSPITALITY_TASK_EXECUTION_FAILED' })
      }
    })
  }

  /**
   * 👤 USER — Mes exécutions
   *
   * GET /v4/user/executions
   * Liste des exécutions de l'utilisateur connecté
   */
  app.get('/v4/user/executions', async (request, reply) => {
    const user = (request as any).user
    if (!user) {
      return reply.code(401).send({ error: 'UNAUTHORIZED' })
    }

    const { getAllExecutions } = await import('./data/taskExecutions.js')
    const allExecutions = getAllExecutions()
    const userExecutions = allExecutions.filter((exec) => exec.userId === user.owner)

    return reply.send({ executions: userExecutions })
  })

  /**
   * 👤 USER — Détail d'une exécution
   *
   * GET /v4/user/executions/:id
   * Détail d'une exécution de l'utilisateur connecté
   */
  app.get('/v4/user/executions/:id', async (request, reply) => {
    const user = (request as any).user
    if (!user) {
      return reply.code(401).send({ error: 'UNAUTHORIZED' })
    }

    const params = request.params as { id: string }
    const exec = getExecutionById(params.id)
    
    if (!exec) {
      return reply.code(404).send({ error: 'EXECUTION_NOT_FOUND' })
    }

    if (exec.userId !== user.owner) {
      return reply.code(403).send({ error: 'FORBIDDEN' })
    }

    return reply.send({ execution: exec })
  })

  /**
   * 🔐 ADMIN — Toutes les exécutions
   *
   * GET /v4/admin/executions
   * Liste toutes les exécutions (admin uniquement)
   */
  app.get(
    '/v4/admin/executions',
    { preHandler: requireAdmin() },
    async (request, reply) => {
      const { getAllExecutions } = await import('./data/taskExecutions.js')
      const executions = getAllExecutions()
      return reply.send({ executions })
    },
  )

  /**
   * 🔐 ADMIN/REVIEWER — Validation humaine
   *
   * GET /v4/admin/tasks/waiting-validation
   * Liste des tâches en attente de validation
   */
  app.get(
    '/v4/admin/tasks/waiting-validation',
    { preHandler: requireReviewer() },
    async (request, reply) => {
      const executions = getExecutionsWaitingValidation()
      return reply.send({ executions })
    },
  )

  /**
   * POST /v4/admin/tasks/:id/validate
   * Valider une tâche en WAITING_VALIDATION
   * Requiert : reviewer | admin
   *
   * Body:
   * {
   *   comment?: string
   * }
   */
  app.post(
    '/v4/admin/tasks/:id/validate',
    { preHandler: requireReviewer() },
    async (request, reply) => {
      const params = request.params as { id: string }
      const body = request.body as { comment?: string }
      const user = (request as any).user

      const exec = await validateExecution(
        params.id,
        body.comment,
        user?.owner,
        user?.role === 'admin' ? 'admin' : 'reviewer',
      )
      if (!exec) {
        return reply.code(404).send({ error: 'EXECUTION_NOT_FOUND_OR_INVALID_STATUS' })
      }

      return reply.send({
        id: exec.id,
        status: exec.status,
        validatedAt: exec.validatedAt,
        validatedBy: exec.validatedBy,
      })
    },
  )

  /**
   * POST /v4/admin/tasks/:id/reject
   * Rejeter une tâche en WAITING_VALIDATION
   * Requiert : reviewer | admin
   *
   * Body:
   * {
   *   reason: string
   *   comment?: string
   * }
   */
  app.post(
    '/v4/admin/tasks/:id/reject',
    { preHandler: requireReviewer() },
    async (request, reply) => {
      const params = request.params as { id: string }
      const body = request.body as { reason: string; comment?: string }
      const user = (request as any).user

      if (!body.reason || typeof body.reason !== 'string' || body.reason.trim().length === 0) {
        return reply.code(400).send({ error: 'REASON_REQUIRED' })
      }

      const exec = await rejectExecution(
        params.id,
        body.reason.trim(),
        body.comment,
        user?.owner,
        user?.role === 'admin' ? 'admin' : 'reviewer',
      )
      if (!exec) {
        return reply.code(404).send({ error: 'EXECUTION_NOT_FOUND_OR_INVALID_STATUS' })
      }

      return reply.send({
        id: exec.id,
        status: exec.status,
        validatedAt: exec.validatedAt,
        validatedBy: exec.validatedBy,
        rejectedReason: exec.rejectedReason,
      })
    },
  )

  /**
   * GET /v4/admin/tasks/:id
   * Détail d'une exécution
   * Requiert : admin | reviewer
   */
  app.get(
    '/v4/admin/tasks/:id',
    { preHandler: requireReviewer() },
    async (request, reply) => {
      const params = request.params as { id: string }
      const exec = getExecutionById(params.id)
      if (!exec) {
        return reply.code(404).send({ error: 'EXECUTION_NOT_FOUND' })
      }
      return reply.send(exec)
    },
  )

  /**
   * 📎 UPLOAD DE PREUVE
   *
   * POST /v4/tasks/:id/proof/upload
   * Requiert : ops | admin
   *
   * Multipart form-data avec champ "file"
   * Types autorisés : image/*, application/pdf
   * Taille max : 10MB
   */
  app.post(
    '/v4/tasks/:id/proof/upload',
    { preHandler: requireOps() },
    async (request, reply) => {
      const params = request.params as { id: string }
      const user = (request as any).user
      const exec = getExecutionById(params.id)

      if (!exec) {
        return reply.code(404).send({ error: 'EXECUTION_NOT_FOUND' })
      }

      // Vérifier que l'utilisateur est propriétaire de l'exécution (sauf admin)
      if (user.role !== 'admin' && exec.userId !== user.owner) {
        return reply.code(403).send({ error: 'FORBIDDEN' })
      }

      if (exec.status !== 'WAITING_PROOF') {
        return reply.code(400).send({ error: 'INVALID_STATUS' })
      }

      if (exec.proofUrl) {
        return reply.code(400).send({ error: 'PROOF_ALREADY_UPLOADED' })
      }

      const data = await request.file()
      if (!data) {
        return reply.code(400).send({ error: 'NO_FILE' })
      }

      if (!isValidFileType(data.mimetype)) {
        return reply.code(400).send({ error: 'INVALID_FILE_TYPE' })
      }

      const buffer = await data.toBuffer()
      const needsValidation = requiresHumanValidation(exec.taskId)

      // Pour les tâches Airbnb/Immobilier, utiliser le stockage photo avec métadonnées
      let proofUrl: string
      let deliverableUrl: string | undefined
      let photoMetadata: any = undefined

      if (exec.taskId === 'airbnb-etat-lieux' || exec.taskId === 'airbnb-description') {
        // Stockage photo avec métadonnées horodatées
        const { savePhotoProof } = await import('./data/photoProofStorage.js')
        const { generateAirbnbDocument } = await import('./services/airbnb.service.js')
        const { updateExecutionDeliverable } = await import('./data/taskExecutions.js')
        const { createAuditLog } = await import('./data/auditLog.js')

        // Extraire l'horodatage de capture depuis le nom de fichier ou utiliser maintenant
        const originalFilename = data.filename || 'photo.jpg'
        const { photoUrl, metadata } = await savePhotoProof(
          params.id,
          exec.taskId,
          buffer,
          originalFilename,
          data.mimetype,
        )

        proofUrl = photoUrl
        photoMetadata = metadata

        // Audit log détaillé pour la preuve photo
        await createAuditLog(
          'PHOTO_PROOF_UPLOADED',
          'proof',
          params.id,
          'user',
          user.owner,
          {
            taskId: exec.taskId,
            executionId: params.id,
            photoUrl: proofUrl,
            capturedAt: metadata.capturedAt,
            uploadedAt: metadata.uploadedAt,
            fileHash: metadata.fileHash,
            fileSize: metadata.fileSize,
            mimeType: metadata.mimeType,
          },
        )

        // Générer le PDF depuis la preuve photo avec métadonnées
        const airbnbResult = await generateAirbnbDocument({
          executionId: params.id,
          taskId: exec.taskId,
          photoUrl: proofUrl,
        })
        deliverableUrl = airbnbResult.documentUrl
        updateExecutionDeliverable(params.id, deliverableUrl)

        // Audit log pour la génération du PDF
        await createAuditLog(
          'AIRBNB_PDF_GENERATED',
          'taskExecution',
          params.id,
          'system',
          undefined,
          {
            taskId: exec.taskId,
            executionId: params.id,
            deliverableUrl,
            photoMetadata: {
              capturedAt: metadata.capturedAt,
              uploadedAt: metadata.uploadedAt,
              fileHash: metadata.fileHash,
            },
          },
        )
      } else {
        // Pour les autres tâches, utiliser le stockage standard
        const filename = `${Date.now()}-${data.filename || 'proof'}`
        proofUrl = await saveProofFile(params.id, filename, buffer)
      }

      const updated = await uploadProof(params.id, proofUrl, needsValidation)
      if (!updated) {
        return reply.code(500).send({ error: 'UPLOAD_FAILED' })
      }

      return reply.send({
        id: updated.id,
        status: updated.status,
        proofUrl: updated.proofUrl,
        proofUploadedAt: updated.proofUploadedAt,
        deliverableUrl,
        photoMetadata, // Métadonnées horodatées pour les tâches Airbnb
      })
    },
  )

  /**
   * 📋 ADMIN/REVIEWER — Audit Logs
   *
   * GET /v4/admin/audit/logs
   * Liste tous les audit logs (limite: 100)
   * Requiert : admin | reviewer
   */
  app.get(
    getAuditLogsRoute.path,
    { preHandler: requireReviewer() },
    async (request, reply) => {
      const query = request.query as { limit?: string }
      const limit = query.limit ? Math.min(500, parseInt(query.limit, 10)) : 100
      const logs = getAllAuditLogs(limit)
      return reply.send({ logs })
    },
  )

  /**
   * GET /v4/admin/audit/executions/:executionId
   * Audit logs pour une exécution spécifique
   * Requiert : admin | reviewer
   */
  app.get(
    getAuditLogsByExecutionRoute.path,
    { preHandler: requireReviewer() },
    async (request, reply) => {
      const params = request.params as { executionId: string }
      const logs = getAuditLogsByTaskExecutionId(params.executionId)
      return reply.send({ executionId: params.executionId, logs })
    },
  )

  /**
   * 💳 ADMIN — Payment Capture (simulée V4)
   *
   * POST /v4/admin/payments/:paymentIntentId/capture
   * Capture un paiement autorisé (simulation pour V4)
   * Requiert : admin
   */
  app.post(
    '/v4/admin/payments/:paymentIntentId/capture',
    { preHandler: requireAdmin() },
    async (request, reply) => {
      const params = request.params as { paymentIntentId: string }
      const { capturePaymentIntent, getPaymentIntentById } = await import('./data/paymentIntents.js')
      const { createAuditLog } = await import('./data/auditLog.js')

      const paymentIntent = getPaymentIntentById(params.paymentIntentId)
    if (!paymentIntent) {
      return reply.code(404).send({ error: 'PAYMENT_INTENT_NOT_FOUND' })
    }

    const captured = capturePaymentIntent(params.paymentIntentId)
    if (!captured) {
      return reply.code(400).send({ error: 'INVALID_PAYMENT_STATUS' })
    }

    try {
      createAuditLog(
        'PAYMENT_CAPTURED',
        'taskExecution',
        paymentIntent.taskExecutionId,
        'admin',
        'admin',
        {
          paymentIntentId: captured.id,
          amount: captured.amount,
          currency: captured.currency,
          capturedAt: captured.capturedAt,
        },
      )
    } catch (err) {
      console.error('Audit log failed:', err)
    }

    return reply.send({
      id: captured.id,
      status: captured.status,
      capturedAt: captured.capturedAt,
    })
  })

  /**
   * GET /v4/admin/payments
   * Liste tous les payment intents
   * Requiert : admin
   */
  app.get(
    '/v4/admin/payments',
    { preHandler: requireAdmin() },
    async (request, reply) => {
      const { getAllPaymentIntents } = await import('./data/paymentIntents.js')
      const intents = getAllPaymentIntents()
      return reply.send({ payments: intents })
    },
  )

  /**
   * 🔐 AUTHENTICATION (PROTECTED ROUTES)
   *
   * Note: Les routes /v4/auth/login et /v4/auth/register sont publiques
   * et montées dans index.ts avant le bloc protégé.
   *
   * POST /v4/auth/logout
   * Déconnexion (révocation de l'API key actuelle)
   * Requiert : utilisateur authentifié
   */
  app.post('/v4/auth/logout', async (request, reply) => {
    const user = (request as any).user
    if (!user) {
      return reply.code(401).send({ error: 'UNAUTHORIZED' })
    }

    try {
      const { logoutUser } = await import('./data/auth.js')
      const { createAuditLog } = await import('./data/auditLog.js')

      const success = await logoutUser(user.owner, user.apiKey)

      if (!success) {
        return reply.code(400).send({ error: 'LOGOUT_FAILED' })
      }

      // Audit log pour le logout
      await createAuditLog(
        'USER_LOGOUT',
        'taskExecution',
        user.owner,
        'user',
        user.owner,
        {
          userId: user.owner,
          owner: user.owner,
          role: user.role,
        },
      )

      return reply.send({ success: true })
    } catch (err) {
      request.log.error({ err }, 'LOGOUT_FAILED')
      return reply.code(500).send({ error: 'LOGOUT_FAILED' })
    }
  })

  /**
   * GET /v4/auth/me
   * Informations sur l'utilisateur actuel
   * Requiert : utilisateur authentifié
   */
  app.get('/v4/auth/me', async (request, reply) => {
    const user = (request as any).user
    if (!user) {
      return reply.code(401).send({ error: 'UNAUTHORIZED' })
    }

    try {
      const { getCurrentUser } = await import('./data/auth.js')
      const { mapLegacyRole } = await import('./guards/role.guard.js')

      const currentUser = await getCurrentUser(user.owner)
      if (!currentUser) {
        return reply.code(404).send({ error: 'USER_NOT_FOUND' })
      }

      const mappedRole = mapLegacyRole(currentUser.role || 'ops')

      return reply.send({
        id: currentUser.id,
        owner: currentUser.owner,
        role: mappedRole,
        createdAt: currentUser.createdAt,
      })
    } catch (err) {
      request.log.error({ err }, 'GET_USER_FAILED')
      return reply.code(500).send({ error: 'GET_USER_FAILED' })
    }
  })

  /**
   * OLD ROUTE - DO NOT USE (kept for reference only)
   * POST /v4/auth/register
   * Cette route est maintenant dans index.ts (publique)
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
      const { registerUser } = await import('./data/auth.js')
      const { createAuditLog } = await import('./data/auditLog.js')

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
      request.log.error({ err, email }, 'REGISTRATION_FAILED')
      return reply.code(500).send({ error: 'REGISTRATION_FAILED' })
    }
  })

  /**
   * GET /v4/admin/me
   * Informations sur l'utilisateur actuel (alias pour compatibilité)
   * Requiert : utilisateur authentifié
   */
  app.get('/v4/admin/me', async (request, reply) => {
    const user = (request as any).user
    if (!user) {
      return reply.code(401).send({ error: 'UNAUTHORIZED' })
    }
    const { mapLegacyRole } = await import('./guards/role.guard.js')
    const mappedRole = mapLegacyRole(user.role || 'ops')
    return reply.send({
      id: user.owner,
      role: mappedRole,
    })
  })

  /**
   * 📊 DASHBOARD CONFORMITÉ & FINANCE
   *
   * GET /v4/admin/dashboard/kpis
   * KPIs pour le dashboard (Admin uniquement)
   */
  app.get(
    '/v4/admin/dashboard/kpis',
    { preHandler: requireAdmin() },
    async (request, reply) => {
      const { getAllPaymentIntents } = await import('./data/paymentIntents.js')
      const { getAllAuditLogs } = await import('./data/auditLog.js')
      const { getAllExecutions } = await import('./data/taskExecutions.js')

      const executions = getAllExecutions()
      const payments = getAllPaymentIntents()
      const auditLogs = getAllAuditLogs(1000)

      // KPIs Conformité
      const totalExecutions = executions.length
      const completedExecutions = executions.filter((e) => e.status === 'COMPLETED').length
      const waitingValidation = executions.filter((e) => e.status === 'WAITING_VALIDATION').length
      const rejectedExecutions = executions.filter((e) => e.status === 'REJECTED').length
      const executionsWithProof = executions.filter((e) => e.proofUrl).length

      // KPIs Finance
      const totalPayments = payments.length
      const capturedPayments = payments.filter((p) => p.status === 'captured').length
      const authorizedPayments = payments.filter((p) => p.status === 'authorized').length
      const canceledPayments = payments.filter((p) => p.status === 'canceled').length
      const totalAmount = payments
        .filter((p) => p.status === 'captured')
        .reduce((sum, p) => sum + p.amount, 0)
      const authorizedAmount = payments
        .filter((p) => p.status === 'authorized')
        .reduce((sum, p) => sum + p.amount, 0)

      // KPIs Audit
      const totalAuditLogs = auditLogs.length
      const recentAuditLogs = auditLogs.filter(
        (log) => new Date(log.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000,
      ).length

      return reply.send({
        compliance: {
          totalExecutions,
          completedExecutions,
          waitingValidation,
          rejectedExecutions,
          executionsWithProof,
          completionRate: totalExecutions > 0 ? (completedExecutions / totalExecutions) * 100 : 0,
        },
        finance: {
          totalPayments,
          capturedPayments,
          authorizedPayments,
          canceledPayments,
          totalAmount,
          authorizedAmount,
          captureRate: totalPayments > 0 ? (capturedPayments / totalPayments) * 100 : 0,
        },
        audit: {
          totalAuditLogs,
          recentAuditLogs,
        },
      })
    },
  )

  /**
   * GET /v4/admin/dashboard/compliance
   * Liste des exécutions pour la table Conformité
   * Requiert : admin | reviewer
   */
  app.get(
    '/v4/admin/dashboard/compliance',
    { preHandler: requireReviewer() },
    async (request, reply) => {
      const query = request.query as {
        status?: string
        proofType?: string
        dateFrom?: string
        dateTo?: string
        limit?: string
      }

      const { getAllExecutions } = await import('./data/taskExecutions.js')
      const { getAuditLogsByTaskExecutionId } = await import('./data/auditLog.js')
      const { taskDefinitions } = await import('./data/taskDefinitions.js')

      let executions = getAllExecutions()

      // Filtres
      if (query.status) {
        executions = executions.filter((e) => e.status === query.status)
      }

      if (query.dateFrom) {
        const dateFrom = new Date(query.dateFrom)
        executions = executions.filter((e) => new Date(e.createdAt) >= dateFrom)
      }

      if (query.dateTo) {
        const dateTo = new Date(query.dateTo)
        executions = executions.filter((e) => new Date(e.createdAt) <= dateTo)
      }

      // Limite
      const limit = query.limit ? parseInt(query.limit, 10) : 100
      executions = executions.slice(0, limit)

      // Enrichir avec les données de conformité
      const enriched = executions.map((exec) => {
        const definition = taskDefinitions.find((def) => def.taskId === exec.taskId)
        const proofType = definition?.config?.proofType || 'none'
        const lastAuditLog = getAuditLogsByTaskExecutionId(exec.id)[0] || null

        return {
          ...exec,
          proofType,
          lastAuditLog: lastAuditLog
            ? {
                eventType: lastAuditLog.eventType,
                createdAt: lastAuditLog.createdAt,
                actorType: lastAuditLog.actorType,
              }
            : null,
        }
      })

      // Filtrer par proofType si demandé
      if (query.proofType) {
        return reply.send({
          executions: enriched.filter((e) => e.proofType === query.proofType),
        })
      }

      return reply.send({ executions: enriched })
    },
  )

  /**
   * GET /v4/admin/dashboard/finance
   * Liste des payment intents pour la table Finance
   * Requiert : admin
   */
  app.get(
    '/v4/admin/dashboard/finance',
    { preHandler: requireAdmin() },
    async (request, reply) => {
      const query = request.query as {
        status?: string
        dateFrom?: string
        dateTo?: string
        limit?: string
      }

      const { getAllPaymentIntents } = await import('./data/paymentIntents.js')
      const { getAuditLogsByTaskExecutionId } = await import('./data/auditLog.js')

      let payments = getAllPaymentIntents()

      // Filtres
      if (query.status) {
        payments = payments.filter((p) => p.status === query.status)
      }

      if (query.dateFrom) {
        const dateFrom = new Date(query.dateFrom)
        payments = payments.filter((p) => new Date(p.createdAt) >= dateFrom)
      }

      if (query.dateTo) {
        const dateTo = new Date(query.dateTo)
        payments = payments.filter((p) => new Date(p.createdAt) <= dateTo)
      }

      // Limite
      const limit = query.limit ? parseInt(query.limit, 10) : 100
      payments = payments.slice(0, limit)

      // Enrichir avec les audit logs
      const enriched = payments.map((payment) => {
        const auditLogs = getAuditLogsByTaskExecutionId(payment.taskExecutionId)
        const paymentAuditLogs = auditLogs.filter(
          (log) =>
            log.eventType === 'PAYMENT_AUTHORIZED' ||
            log.eventType === 'PAYMENT_CAPTURED' ||
            log.eventType === 'PAYMENT_CANCELED',
        )

        return {
          ...payment,
          auditLogs: paymentAuditLogs.map((log) => ({
            id: log.id,
            eventType: log.eventType,
            createdAt: log.createdAt,
            metadata: log.metadata,
          })),
        }
      })

      return reply.send({ payments: enriched })
    },
  )

  /**
   * GET /v4/admin/dashboard/audit-timeline
   * Timeline chronologique des audit logs
   * Requiert : admin | reviewer
   */
  app.get(
    '/v4/admin/dashboard/audit-timeline',
    { preHandler: requireReviewer() },
    async (request, reply) => {
      const query = request.query as {
        entityId?: string
        eventType?: string
        limit?: string
      }

      const { getAllAuditLogs } = await import('./data/auditLog.js')

      let logs = getAllAuditLogs(1000)

      // Filtres
      if (query.entityId) {
        logs = logs.filter((log) => log.entityId === query.entityId)
      }

      if (query.eventType) {
        logs = logs.filter((log) => log.eventType === query.eventType)
      }

      // Limite
      const limit = query.limit ? parseInt(query.limit, 10) : 200
      logs = logs.slice(0, limit)

      return reply.send({ logs })
    },
  )

  /**
   * ⚖️ LITIGES & ARBITRAGE
   *
   * POST /v4/disputes
   * Ouvrir un litige sur une exécution
   * Requiert : utilisateur authentifié
   */
  app.post('/v4/disputes', async (request, reply) => {
    const user = (request as any).user
    if (!user) {
      return reply.code(401).send({ error: 'UNAUTHORIZED' })
    }

    const body = request.body as {
      taskExecutionId: string
      type: 'result' | 'proof' | 'validation'
      reason: string
    }

    if (!body.taskExecutionId || !body.type || !body.reason || body.reason.trim().length === 0) {
      return reply.code(400).send({ error: 'INVALID_INPUT' })
    }

    const { getExecutionById } = await import('./data/taskExecutions.js')
    const { getAuditLogsByTaskExecutionId } = await import('./data/auditLog.js')
    const { createDispute, getDisputesByExecutionId } = await import('./data/disputes.js')
    const { createAuditLog } = await import('./data/auditLog.js')

    const execution = getExecutionById(body.taskExecutionId)
    if (!execution) {
      return reply.code(404).send({ error: 'EXECUTION_NOT_FOUND' })
    }

    // Vérifier que l'exécution appartient à l'utilisateur
    if (execution.userId !== user.owner) {
      return reply.code(403).send({ error: 'FORBIDDEN' })
    }

    // Vérifier que l'exécution est COMPLETED ou REJECTED
    if (execution.status !== 'COMPLETED' && execution.status !== 'REJECTED') {
      return reply.code(400).send({ error: 'INVALID_EXECUTION_STATUS' })
    }

    // Vérifier qu'un audit log existe
    const auditLogs = getAuditLogsByTaskExecutionId(body.taskExecutionId)
    if (auditLogs.length === 0) {
      return reply.code(400).send({ error: 'NO_AUDIT_LOG_FOUND' })
    }

    // Vérifier qu'il n'y a pas déjà un litige ouvert pour cette exécution
    const existingDisputes = getDisputesByExecutionId(body.taskExecutionId)
    const openDispute = existingDisputes.find(
      (d) => d.status === 'OPEN' || d.status === 'UNDER_REVIEW',
    )
    if (openDispute) {
      return reply.code(400).send({ error: 'DISPUTE_ALREADY_OPEN' })
    }

    // Créer le litige
    const dispute = createDispute(body.taskExecutionId, user.owner, body.type, body.reason.trim())

    // Mettre le paiement en attente si pas déjà capturé
    const { getPaymentIntentByExecutionId, setPaymentIntentOnHold } = await import('./data/paymentIntents.js')
    const paymentIntent = getPaymentIntentByExecutionId(body.taskExecutionId)
    if (paymentIntent && paymentIntent.status !== 'captured' && paymentIntent.status !== 'on_hold') {
      setPaymentIntentOnHold(paymentIntent.id, `Dispute opened: ${dispute.id}`)
      try {
        await createAuditLog(
          'PAYMENT_ON_HOLD',
          'taskExecution',
          body.taskExecutionId,
          'system',
          undefined,
          {
            paymentIntentId: paymentIntent.id,
            disputeId: dispute.id,
            reason: 'Dispute opened',
          },
        )
      } catch (err) {
        console.error('Audit log failed:', err)
      }
    }

    // Audit
    try {
      await createAuditLog(
        'DISPUTE_OPENED',
        'dispute',
        dispute.id,
        'user',
        user.owner,
        {
          taskExecutionId: body.taskExecutionId,
          type: body.type,
          reason: body.reason,
        },
      )
    } catch (err) {
      console.error('Audit log failed:', err)
    }

    return reply.send({
      id: dispute.id,
      status: dispute.status,
      createdAt: dispute.createdAt,
    })
  })

  /**
   * GET /v4/disputes
   * Liste les litiges de l'utilisateur
   */
  app.get('/v4/disputes', async (request, reply) => {
    const user = (request as any).user
    if (!user) {
      return reply.code(401).send({ error: 'UNAUTHORIZED' })
    }

    const { getDisputesByUserId } = await import('./data/disputes.js')
    const disputes = getDisputesByUserId(user.owner)

    return reply.send({ disputes })
  })

  /**
   * GET /v4/disputes/:id
   * Détail d'un litige
   */
  app.get('/v4/disputes/:id', async (request, reply) => {
    const user = (request as any).user
    if (!user) {
      return reply.code(401).send({ error: 'UNAUTHORIZED' })
    }

    const params = request.params as { id: string }
    const { getDisputeById } = await import('./data/disputes.js')
    const { getExecutionById } = await import('./data/taskExecutions.js')
    const { getAuditLogsByTaskExecutionId } = await import('./data/auditLog.js')

    const dispute = getDisputeById(params.id)
    if (!dispute) {
      return reply.code(404).send({ error: 'DISPUTE_NOT_FOUND' })
    }

    // Vérifier l'accès
    const { mapLegacyRole } = await import('./guards/role.guard.js')
    const userRole = mapLegacyRole(user.role || 'ops')
    if (dispute.userId !== user.owner && userRole !== 'admin' && userRole !== 'reviewer') {
      return reply.code(403).send({ error: 'FORBIDDEN' })
    }

    // Enrichir avec les données de l'exécution et les audit logs
    const execution = getExecutionById(dispute.taskExecutionId)
    const auditLogs = getAuditLogsByTaskExecutionId(dispute.taskExecutionId)

    return reply.send({
      ...dispute,
      execution,
      auditLogs,
    })
  })

  /**
   * POST /v4/admin/disputes/:id/resolve
   * Résoudre un litige (arbitrage)
   * Requiert : admin | reviewer
   */
  app.post(
    '/v4/admin/disputes/:id/resolve',
    { preHandler: requireReviewer() },
    async (request, reply) => {
      const params = request.params as { id: string }
      const body = request.body as {
        resolution: 'RESOLVED_IN_FAVOR_USER' | 'RESOLVED_IN_FAVOR_SNAPTASK'
        resolutionComment: string
      }
      const user = (request as any).user

      if (!body.resolution || !body.resolutionComment || body.resolutionComment.trim().length === 0) {
        return reply.code(400).send({ error: 'INVALID_INPUT' })
      }

      const { getDisputeById, updateDisputeStatus } = await import('./data/disputes.js')
      const { getExecutionById } = await import('./data/taskExecutions.js')
      const { getPaymentIntentByExecutionId, refundPaymentIntent, setPaymentIntentOnHold } = await import('./data/paymentIntents.js')
      const { createAuditLog } = await import('./data/auditLog.js')
      const { mapLegacyRole } = await import('./guards/role.guard.js')

      const dispute = getDisputeById(params.id)
      if (!dispute) {
        return reply.code(404).send({ error: 'DISPUTE_NOT_FOUND' })
      }

      if (dispute.status !== 'OPEN' && dispute.status !== 'UNDER_REVIEW') {
        return reply.code(400).send({ error: 'INVALID_DISPUTE_STATUS' })
      }

      const userRole = mapLegacyRole(user.role || 'ops')
      const decidedBy = userRole === 'admin' ? 'admin' : 'reviewer'

      // Mettre le paiement en attente si pas déjà capturé
      const execution = getExecutionById(dispute.taskExecutionId)
      if (execution) {
        const paymentIntent = getPaymentIntentByExecutionId(dispute.taskExecutionId)
        if (paymentIntent && paymentIntent.status !== 'captured' && paymentIntent.status !== 'on_hold') {
          setPaymentIntentOnHold(paymentIntent.id, `Dispute opened: ${dispute.id}`)
          try {
            await createAuditLog(
              'PAYMENT_ON_HOLD',
              'taskExecution',
              dispute.taskExecutionId,
              'system',
              undefined,
              {
                paymentIntentId: paymentIntent.id,
                disputeId: dispute.id,
                reason: 'Dispute opened',
              },
            )
          } catch (err) {
            console.error('Audit log failed:', err)
          }
        }
      }

      // Mettre à jour le statut du litige
      const updated = updateDisputeStatus(
        params.id,
        body.resolution,
        body.resolutionComment.trim(),
        decidedBy,
      )
      if (!updated) {
        return reply.code(500).send({ error: 'UPDATE_FAILED' })
      }

      // Si résolu en faveur de l'utilisateur, rembourser le paiement
      if (body.resolution === 'RESOLVED_IN_FAVOR_USER') {
        const execution = getExecutionById(dispute.taskExecutionId)
        if (execution) {
          const paymentIntent = getPaymentIntentByExecutionId(dispute.taskExecutionId)
          if (paymentIntent) {
            const refunded = refundPaymentIntent(paymentIntent.id, `Dispute resolved in favor of user: ${dispute.id}`)
            if (refunded) {
              try {
                await createAuditLog(
                  'PAYMENT_REFUNDED',
                  'taskExecution',
                  dispute.taskExecutionId,
                  decidedBy,
                  user.owner,
                  {
                    disputeId: dispute.id,
                    paymentIntentId: paymentIntent.id,
                    amount: paymentIntent.amount,
                    currency: paymentIntent.currency,
                    reason: `Dispute resolved in favor of user`,
                  },
                )
              } catch (err) {
                console.error('Audit log failed:', err)
              }
            }
          }
        }
      }

      // Audit de la résolution
      try {
        await createAuditLog(
          'DISPUTE_RESOLVED',
          'dispute',
          params.id,
          decidedBy,
          user.owner,
          {
            resolution: body.resolution,
            resolutionComment: body.resolutionComment,
            decidedBy,
          },
        )
      } catch (err) {
        console.error('Audit log failed:', err)
      }

      return reply.send({
        id: updated.id,
        status: updated.status,
        resolution: updated.resolution,
        decidedBy: updated.decidedBy,
        decidedAt: updated.decidedAt,
      })
    },
  )

  /**
   * POST /v4/admin/disputes/:id/review
   * Passer un litige en UNDER_REVIEW
   * Requiert : admin | reviewer
   */
  app.post(
    '/v4/admin/disputes/:id/review',
    { preHandler: requireReviewer() },
    async (request, reply) => {
      const params = request.params as { id: string }
      const { getDisputeById, updateDisputeStatus } = await import('./data/disputes.js')

      const dispute = getDisputeById(params.id)
      if (!dispute) {
        return reply.code(404).send({ error: 'DISPUTE_NOT_FOUND' })
      }

      if (dispute.status !== 'OPEN') {
        return reply.code(400).send({ error: 'INVALID_DISPUTE_STATUS' })
      }

      const updated = updateDisputeStatus(params.id, 'UNDER_REVIEW')
      if (!updated) {
        return reply.code(500).send({ error: 'UPDATE_FAILED' })
      }

      return reply.send({
        id: updated.id,
        status: updated.status,
      })
    },
  )

  /**
   * GET /v4/admin/disputes
   * Liste tous les litiges (admin/reviewer)
   * Requiert : admin | reviewer
   */
  app.get(
    '/v4/admin/disputes',
    { preHandler: requireReviewer() },
    async (request, reply) => {
      const query = request.query as {
        status?: string
        limit?: string
      }

      const { getAllDisputes, getDisputesByStatus } = await import('./data/disputes.js')

      let disputes = query.status ? getDisputesByStatus(query.status as any) : getAllDisputes()

      const limit = query.limit ? parseInt(query.limit, 10) : 100
      disputes = disputes.slice(0, limit)

      return reply.send({ disputes })
    },
  )

  /**
   * GET /v4/admin/tasks/pricing
   * Liste toutes les tâches avec leur pricing (admin)
   * Requiert : pricing.manage
   */
  app.get(
    '/v4/admin/tasks/pricing',
    { preHandler: requirePermission('pricing.manage') },
    async (request, reply) => {
      const tasks = taskDefinitions.map((def) => ({
        taskId: def.taskId,
        version: def.version,
        category: def.category,
        pricing: def.pricing,
      }))

      return reply.send({ tasks })
    },
  )

  /**
   * PUT /v4/admin/tasks/:taskId/:version/pricing
   * Met à jour le pricing d'une tâche (admin)
   * Requiert : pricing.manage
   */
  app.put(
    '/v4/admin/tasks/:taskId/:version/pricing',
    { preHandler: requirePermission('pricing.manage') },
    async (request, reply) => {
      const params = request.params as { taskId: string; version: string }
      const body = request.body as {
        amount: number
        currency: string
        slaTier: 'standard' | 'priority' | 'enterprise'
        proofIncluded: boolean
        reason?: string
      }
      const user = (request as any).user

      const { updateTaskPricing } = await import('./data/taskDefinitions.js')
      const updated = await updateTaskPricing(
        params.taskId,
        params.version,
        {
          amount: body.amount,
          currency: body.currency,
          slaTier: body.slaTier,
          proofIncluded: body.proofIncluded,
        },
        user.owner,
        body.reason,
      )

      if (!updated) {
        return reply.code(404).send({ error: 'TASK_NOT_FOUND' })
      }

      return reply.send({ task: updated })
    },
  )

  /**
   * GET /v4/admin/tasks/:taskId/:version/pricing/history
   * Récupère l'historique des changements de pricing (admin)
   * Requiert : pricing.manage
   */
  app.get(
    '/v4/admin/tasks/:taskId/:version/pricing/history',
    { preHandler: requirePermission('pricing.manage') },
    async (request, reply) => {
      const params = request.params as { taskId: string; version: string }
      const { getPricingHistory } = await import('./data/pricing.js')

      const history = getPricingHistory(params.taskId, params.version)

      return reply.send({ history })
    },
  )

  /**
   * GET /v4/admin/permissions
   * Liste les permissions disponibles et les rôles (admin)
   * Requiert : tenant.manage
   */
  app.get(
    '/v4/admin/permissions',
    { preHandler: requirePermission('tenant.manage') },
    async (request, reply) => {
      const { ROLE_PERMISSIONS, PERMISSIONS } = await import('./models/permission.js')

      return reply.send({
        permissions: Object.values(PERMISSIONS),
        rolePermissions: ROLE_PERMISSIONS,
      })
    },
  )

  /**
   * GET /v4/admin/tenants/:tenantId/roles
   * Récupère les surcharges de rôles pour un tenant (admin)
   * Requiert : tenant.manage
   */
  app.get(
    '/v4/admin/tenants/:tenantId/roles',
    { preHandler: requirePermission('tenant.manage') },
    async (request, reply) => {
      const params = request.params as { tenantId: string }
      const { getTenantRoleOverrides } = await import('./data/tenantRoles.js')

      const overrides = getTenantRoleOverrides(params.tenantId)

      return reply.send({ tenantId: params.tenantId, overrides })
    },
  )

  /**
   * PUT /v4/admin/tenants/:tenantId/roles/:role
   * Met à jour les permissions d'un rôle pour un tenant (admin)
   * Requiert : tenant.manage
   */
  app.put(
    '/v4/admin/tenants/:tenantId/roles/:role',
    { preHandler: requirePermission('tenant.manage') },
    async (request, reply) => {
      const params = request.params as { tenantId: string; role: string }
      const body = request.body as { permissions: string[] }
      const user = (request as any).user

      const { setTenantRoleOverride } = await import('./data/tenantRoles.js')
      const { createAuditLog } = await import('./data/auditLog.js')

      const override = setTenantRoleOverride(params.tenantId, params.role, body.permissions as any)

      // Audit log
      await createAuditLog(
        'TENANT_ROLE_OVERRIDE_UPDATED',
        'tenant',
        params.tenantId,
        'admin',
        user.owner,
        {
          tenantId: params.tenantId,
          role: params.role,
          permissions: body.permissions,
        },
      )

      return reply.send({ override })
    },
  )

}
