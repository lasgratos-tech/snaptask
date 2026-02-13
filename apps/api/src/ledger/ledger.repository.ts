import prisma from '../prisma/client.js'

class LedgerRepository {
  async getBalance(owner: string): Promise<number> {
  if (!owner) {
    return 0
  }

  const account = await prisma.ledgerAccount.findUnique({
    where: { owner },
  })

  // Aucun compte encore créé → solde = 0
  if (!account) {
    return 0
  }

  return account.balance
}


  async debit(params: {
    userId: string
    amountCents: number
    currency: string
    idempotencyKey: string
    reason: string
  }) {
    const { userId, amountCents } = params

    await prisma.ledgerEvent.create({
      data: {
        owner: userId,
        amount: amountCents,
        reason: params.reason,
        type: 'DEBIT',
      },
    })

    await prisma.ledgerAccount.update({
      where: { owner: userId },
      data: {
        balance: {
          decrement: amountCents,
        },
      },
    })
  }
}

export const ledgerRepository = new LedgerRepository()
