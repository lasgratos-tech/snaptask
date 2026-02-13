-- Migration pour synchroniser le schéma PostgreSQL avec Prisma
-- AlterTable
ALTER TABLE "ApiKey" DROP CONSTRAINT "ApiKey_pkey",
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'client',
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "LedgerAccount" DROP CONSTRAINT "LedgerAccount_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "updatedAt" DROP DEFAULT,
ADD CONSTRAINT "LedgerAccount_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ADD COLUMN     "updatedAt" TIMESTAMP(3),
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
-- Set default value for existing rows
UPDATE "User" SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;
-- Make column NOT NULL after setting values
ALTER TABLE "User" ALTER COLUMN "updatedAt" SET NOT NULL;

-- DropTable
DROP TABLE "TaskExecution";

-- DropEnum
DROP TYPE "TaskExecutionStatus";

-- CreateIndex
CREATE INDEX "ApiKey_owner_idx" ON "ApiKey"("owner");

-- CreateIndex
CREATE INDEX "LedgerEvent_owner_idx" ON "LedgerEvent"("owner");

