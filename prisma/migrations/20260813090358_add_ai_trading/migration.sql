-- CreateEnum
CREATE TYPE "AITradeStrategy" AS ENUM ('CONSERVATIVE', 'BALANCED', 'AGGRESSIVE');

-- CreateEnum
CREATE TYPE "AIRiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "AITradeSide" AS ENUM ('BUY', 'SELL');

-- CreateEnum
CREATE TYPE "AITradeStatus" AS ENUM ('PENDING', 'OPEN', 'CLOSED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AITradeSignal" AS ENUM ('BUY', 'SELL', 'WAIT');

-- CreateTable
CREATE TABLE "AITradeSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "strategy" "AITradeStrategy" NOT NULL DEFAULT 'BALANCED',
    "riskLevel" "AIRiskLevel" NOT NULL DEFAULT 'MEDIUM',
    "minimumConfidence" DOUBLE PRECISION NOT NULL DEFAULT 70,
    "maximumTradeAllocation" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "stopLossProtection" BOOLEAN NOT NULL DEFAULT true,
    "dailyLossProtection" BOOLEAN NOT NULL DEFAULT true,
    "emergencyStop" BOOLEAN NOT NULL DEFAULT true,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AITradeSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AITrade" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "settingsId" TEXT,
    "coin" "Coin" NOT NULL,
    "pair" TEXT NOT NULL,
    "side" "AITradeSide" NOT NULL,
    "status" "AITradeStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DOUBLE PRECISION NOT NULL,
    "entryPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currentPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "exitPrice" DOUBLE PRECISION,
    "profit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "openedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AITrade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AITradeDecision" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "settingsId" TEXT,
    "coin" "Coin" NOT NULL,
    "pair" TEXT NOT NULL,
    "signal" "AITradeSignal" NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "reason" TEXT,
    "executed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AITradeDecision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AITradeSettings_userId_key" ON "AITradeSettings"("userId");

-- CreateIndex
CREATE INDEX "AITradeSettings_userId_idx" ON "AITradeSettings"("userId");

-- CreateIndex
CREATE INDEX "AITrade_userId_idx" ON "AITrade"("userId");

-- CreateIndex
CREATE INDEX "AITrade_status_idx" ON "AITrade"("status");

-- CreateIndex
CREATE INDEX "AITrade_coin_idx" ON "AITrade"("coin");

-- CreateIndex
CREATE INDEX "AITrade_createdAt_idx" ON "AITrade"("createdAt");

-- CreateIndex
CREATE INDEX "AITradeDecision_userId_idx" ON "AITradeDecision"("userId");

-- CreateIndex
CREATE INDEX "AITradeDecision_coin_idx" ON "AITradeDecision"("coin");

-- CreateIndex
CREATE INDEX "AITradeDecision_signal_idx" ON "AITradeDecision"("signal");

-- CreateIndex
CREATE INDEX "AITradeDecision_createdAt_idx" ON "AITradeDecision"("createdAt");

-- AddForeignKey
ALTER TABLE "AITradeSettings" ADD CONSTRAINT "AITradeSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AITrade" ADD CONSTRAINT "AITrade_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AITrade" ADD CONSTRAINT "AITrade_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "AITradeSettings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AITradeDecision" ADD CONSTRAINT "AITradeDecision_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AITradeDecision" ADD CONSTRAINT "AITradeDecision_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "AITradeSettings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
