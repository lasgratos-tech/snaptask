-- CreateEnum
CREATE TYPE "LedgerEventType" AS ENUM ('CREDIT', 'DEBIT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'client',
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LedgerAccount" (
    "id" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LedgerAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LedgerEvent" (
    "id" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "type" "LedgerEventType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LedgerEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskExecution" (
    "id" TEXT NOT NULL,
    "userOwner" TEXT NOT NULL,
    "taskCode" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "paymentIntentId" TEXT,
    "idempotencyKey" TEXT NOT NULL,
    "outputPath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "executedAt" TIMESTAMP(3),

    CONSTRAINT "TaskExecution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_owner_key" ON "User"("owner");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_key_key" ON "ApiKey"("key");

-- CreateIndex
CREATE INDEX "ApiKey_owner_idx" ON "ApiKey"("owner");

-- CreateIndex
CREATE UNIQUE INDEX "LedgerAccount_owner_key" ON "LedgerAccount"("owner");

-- CreateIndex
CREATE INDEX "LedgerEvent_owner_idx" ON "LedgerEvent"("owner");

-- CreateIndex
CREATE UNIQUE INDEX "TaskExecution_paymentIntentId_key" ON "TaskExecution"("paymentIntentId");

-- CreateIndex
CREATE UNIQUE INDEX "TaskExecution_idempotencyKey_key" ON "TaskExecution"("idempotencyKey");

-- CreateIndex
CREATE INDEX "TaskExecution_userOwner_idx" ON "TaskExecution"("userOwner");

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_owner_fkey" FOREIGN KEY ("owner") REFERENCES "User"("owner") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerAccount" ADD CONSTRAINT "LedgerAccount_owner_fkey" FOREIGN KEY ("owner") REFERENCES "User"("owner") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEvent" ADD CONSTRAINT "LedgerEvent_owner_fkey" FOREIGN KEY ("owner") REFERENCES "LedgerAccount"("owner") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskExecution" ADD CONSTRAINT "TaskExecution_userOwner_fkey" FOREIGN KEY ("userOwner") REFERENCES "User"("owner") ON DELETE CASCADE ON UPDATE CASCADE;
