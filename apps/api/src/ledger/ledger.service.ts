import { prisma } from '@/prisma/client';
import { LedgerEventType } from '@prisma/client';

type DebitParams = {
  owner: string;
  amount: number;
  reason: string; // ex: TASK:IMAGE
};

export async function authorizeAndDebit({
  owner,
  amount,
  reason,
}: DebitParams) {
  if (amount <= 0) {
    throw new Error('INVALID_DEBIT_AMOUNT');
  }

  return prisma.$transaction(async (tx) => {
    const account = await tx.ledgerAccount.findUnique({
      where: { owner },
    });

    if (!account) {
      throw new Error('ACCOUNT_NOT_FOUND');
    }

    if (account.balance < amount) {
      throw new Error('INSUFFICIENT_FUNDS');
    }

    const balanceBefore = account.balance;
    const balanceAfter = balanceBefore - amount;

    await tx.ledgerAccount.update({
      where: { owner },
      data: { balance: balanceAfter },
    });

    await tx.ledgerEvent.create({
      data: {
        owner,
        amount: -amount,
        reason, // NORMALISÉ (TASK:IMAGE)
        type: LedgerEventType.DEBIT,
      },
    });

    // LOG MÉTIER (CRITIQUE)
    console.info('LEDGER_DEBIT', {
      owner,
      amount,
      reason,
      balanceBefore,
      balanceAfter,
    });

    return {
      success: true,
      balanceBefore,
      balanceAfter,
    };
  });
}
