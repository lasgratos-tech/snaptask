import { prisma } from '@/prisma/client';

export class LedgerService {
  static async ensureAccount(owner: string) {
    const existing = await prisma.ledgerAccount.findUnique({
      where: { owner },
    });

    if (existing) {
      return existing;
    }

    return prisma.ledgerAccount.create({
      data: {
        owner,
        balance: 0,
      },
    });
  }
}
