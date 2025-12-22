import { prisma } from '@/prisma/client';
import { LedgerEventType } from '@prisma/client';

type CompensationParams = {
  owner: string;
  amount: number;
  reason: string; // ex: REFUND:TASK:IMAGE
};

export async function compensateCredit({
  owner,
  amount,
  reason,
}: CompensationParams) {
  if (amount <= 0) {
    throw new Error('INVALID_CREDIT_AMOUNT');
  }

  return prisma.$transaction(async (tx) => {
    const account = await tx.ledgerAccount.findUnique({
      where: { owner },
    });

    if (!account) {
      throw new Error('ACCOUNT_NOT_FOUND');
    }

    const balanceBefore = account.balance;
    const balanceAfter = balanceBefore + amount;

    await tx.ledgerAccount.update({
      where: { owner },
      data: { balance: balanceAfter },
    });

    await tx.ledgerEvent.create({
      data: {
        owner,
        amount: amount,
        reason,
        type: LedgerEventType.CREDIT,
      },
    });

    console.info('LEDGER_CREDIT_COMPENSATION', {
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
