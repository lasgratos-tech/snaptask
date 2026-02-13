
import { taskPricingRegistry } from './task.pricing.registry.js'
import { ledgerRepository } from '../../ledger/ledger.repository.js'
import prisma from '../../prisma/client.js'
import { taskRegistryV2 } from './task.registry.v2.js'
class TaskOrchestrator {
  async execute(params: {
    apiKey: string
    taskCode: string
    taskVersion: number
    input: unknown
    idempotencyKey: string
  }) {
    const { apiKey, taskCode, taskVersion, input, idempotencyKey } = params

    // 1️⃣ API KEY
    const key = await prisma.apiKey.findUnique({
      where: { key: apiKey },
      include: { user: true },
    })
    if (!key) {
      throw new Error('UNAUTHORIZED')
    }

    // 2️⃣ IDEMPOTENCE (TEMPORAIREMENT DÉSACTIVÉE)
// const existing = await prisma.taskExecution.findUnique({
//   where: { idempotencyKey },
// })
// if (existing) {
//   return existing.response
// }


   // 3️⃣ TASK REGISTRY (V2 only)
const task = taskRegistryV2.get(taskCode, taskVersion)
if (!task) {
  throw new Error('TASK_NOT_REGISTERED')
}


    // 4️⃣ PRICING
    const pricing = taskPricingRegistry.get(taskCode, taskVersion)
    if (!pricing) {
      throw new Error('TASK_PRICING_MISSING')
    }

    // 5️⃣ SOLDE
    const balance = await ledgerRepository.getBalance(key.userId)
    if (balance < pricing.amountCents) {
      throw new Error('INSUFFICIENT_FUNDS')
    }

    // 6️⃣ EXECUTION IA
    const output = await task.run(input)

    // 7️⃣ LEDGER (DEBIT — APPEND ONLY)
    await ledgerRepository.debit({
      userId: key.userId,
      amountCents: pricing.amountCents,
      currency: pricing.currency,
      idempotencyKey,
      reason: taskCode,
    })

    // 8️⃣ TASK EXECUTION
    const response = {
      status: 'success',
      taskCode,
      version: taskVersion,
      output,
      cost: pricing,
    }

    // await prisma.taskExecution.create({
//   data: {
//     idempotencyKey,
//     taskCode,
//     taskVersion,
//     input,
//     output,
//     response,
//     userId: owner, // ⚠️ owner, PAS userId
//     status: 'SUCCESS',
//   },
// })


    return response
  }
}

export const taskOrchestrator = new TaskOrchestrator()
