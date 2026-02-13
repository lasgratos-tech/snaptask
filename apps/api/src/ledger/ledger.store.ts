import prisma from '../prisma/client.js'

export async function getAccount(owner: string) {
  let account = await prisma.ledgerAccount.findUnique({
    where: { owner },
  });

  if (!account) {
    account = await prisma.ledgerAccount.create({
      data: {
        owner,
        balance: 0,
      },
    });
  }

  return account;
}

export async function creditAccount(
  owner: string,
  amount: number,
  reason: string
) {
  await prisma.$transaction(async (tx) => {
    const account = await tx.ledgerAccount.upsert({
      where: { owner },
      update: {
        balance: { increment: amount },
      },
      create: {
        owner,
        balance: amount,
      },
    });

    await tx.ledgerEvent.create({
      data: {
        owner,
        amount,
        reason,
        type: 'CREDIT',
      },
    });

    return account;
  });
}

export async function debitAccount(
  owner: string,
  amount: number,
  reason: string
) {
  await prisma.$transaction(async (tx) => {
    const account = await tx.ledgerAccount.findUnique({
      where: { owner },
    });

    if (!account || account.balance < amount) {
      throw new Error('INSUFFICIENT_CREDITS');
    }

    await tx.ledgerAccount.update({
      where: { owner },
      data: {
        balance: { decrement: amount },
      },
    });

    await tx.ledgerEvent.create({
      data: {
        owner,
        amount,
        reason,
        type: 'DEBIT',
      },
    });
  });
}
