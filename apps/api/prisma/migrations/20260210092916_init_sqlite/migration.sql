-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "owner" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'client',
    "revokedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ApiKey_owner_fkey" FOREIGN KEY ("owner") REFERENCES "User" ("owner") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LedgerAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "owner" TEXT NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LedgerAccount_owner_fkey" FOREIGN KEY ("owner") REFERENCES "User" ("owner") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LedgerEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "owner" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LedgerEvent_owner_fkey" FOREIGN KEY ("owner") REFERENCES "LedgerAccount" ("owner") ON DELETE CASCADE ON UPDATE CASCADE
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
