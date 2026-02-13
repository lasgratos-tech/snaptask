import { prisma } from "@/prisma/client.js";

export async function countLedgerEntries(idempotencyKey: string) {
  return prisma.ledgerEntry.count({
    where: { idempotencyKey },
  });
}

export async function countTaskExecutions(idempotencyKey: string) {
  return prisma.taskExecution.count({
    where: { idempotencyKey },
  });
}

export async function findCompensation(originalKey: string) {
  return prisma.ledgerEntry.findFirst({
    where: {
      idempotencyKey: `COMPENSATION:${originalKey}`,
    },
  });
}
