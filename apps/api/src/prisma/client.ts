import { PrismaClient } from '@prisma/client'

/**
 * PrismaClient unique pour l'application.
 *
 * ESM-ready, sans hack ni proxy : l'export nommé `PrismaClient`
 * vient directement de `@prisma/client`, généré par Prisma en mode ESM.
 */
const prisma = new PrismaClient()

export default prisma
