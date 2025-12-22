import { prisma } from '@/prisma/client';

export async function listEvents(owner?: string) {
  return prisma.ledgerEvent.findMany({
    where: owner ? { owner } : undefined,
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
}
