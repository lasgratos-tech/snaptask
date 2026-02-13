import type { FastifyInstance } from 'fastify'
import { billingService } from './billing.service.js'

export async function billingRoutes(app: FastifyInstance) {
  app.get('/billing/plans', async () => {
    return billingService.listPlans()
  })
}
