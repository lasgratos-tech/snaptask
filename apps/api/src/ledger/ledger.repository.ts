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

    await prisma.$transaction(async (tx) => {
      // Créer le compte s'il n'existe pas (balance = 0)
      await tx.ledgerAccount.upsert({
        where: { owner: userId },
        update: {},
        create: {
          owner: userId,
          balance: 0,
          updatedAt: new Date(),
        },
      })

      // Débit atomique : updateMany avec condition sur le solde
      // Ne met à jour que si balance >= amountCents (protection contre race condition)
      const updateResult = await tx.ledgerAccount.updateMany({
        where: {
          owner: userId,
          balance: { gte: amountCents },
        },
        data: {
          balance: {
            decrement: amountCents,
          },
        },
      })

      // Vérifier que le débit a réussi (count === 0 signifie solde insuffisant)
      if (updateResult.count === 0) {
        throw new Error('INSUFFICIENT_CREDITS')
      }

      // Création de l'événement uniquement si le débit a réussi
      await tx.ledgerEvent.create({
        data: {
          owner: userId,
          amount: amountCents,
          reason: params.reason,
          type: 'DEBIT',
        },
      })
    })
  }
}

export const ledgerRepository = new LedgerRepository()
