import { prisma } from '@/prisma/client';

export async function getApiKeyOwner(
  apiKey: string
): Promise<string | null> {
  const record = await prisma.apiKey.findFirst({
    where: {
      key: apiKey,
      revokedAt: null,
    },
    select: {
      owner: true,
    },
  });

  return record?.owner ?? null;
}

