import prisma from '../prisma/client.js'

export async function getLedgerHistory(owner: string) {
  return prisma.ledgerEvent.findMany({
    where: { owner },
    orderBy: { createdAt: 'desc' },
  })
}
