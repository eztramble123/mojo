-- CreateTable
CREATE TABLE "Session" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "exerciser" TEXT NOT NULL,
    "exerciseType" INTEGER NOT NULL,
    "targetReps" INTEGER NOT NULL,
    "actualReps" INTEGER NOT NULL DEFAULT 0,
    "startTime" INTEGER NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 0,
    "totalUpBets" TEXT NOT NULL DEFAULT '0',
    "totalDownBets" TEXT NOT NULL DEFAULT '0',
    "targetMet" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "Bet" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sessionId" INTEGER NOT NULL,
    "bettor" TEXT NOT NULL,
    "isUp" BOOLEAN NOT NULL,
    "amount" TEXT NOT NULL,
    "claimed" BOOLEAN NOT NULL DEFAULT false,
    "payout" TEXT NOT NULL DEFAULT '0',
    CONSTRAINT "Bet_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Fighter" (
    "address" TEXT NOT NULL PRIMARY KEY,
    "strength" INTEGER NOT NULL DEFAULT 0,
    "agility" INTEGER NOT NULL DEFAULT 0,
    "endurance" INTEGER NOT NULL DEFAULT 0,
    "totalReps" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "username" TEXT
);

-- CreateTable
CREATE TABLE "Challenge" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "challenger" TEXT NOT NULL,
    "opponent" TEXT NOT NULL,
    "wager" TEXT NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 0,
    "winner" TEXT NOT NULL DEFAULT '0x0000000000000000000000000000000000000000',
    "payout" TEXT NOT NULL DEFAULT '0',
    CONSTRAINT "Challenge_challenger_fkey" FOREIGN KEY ("challenger") REFERENCES "Fighter" ("address") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Challenge_opponent_fkey" FOREIGN KEY ("opponent") REFERENCES "Fighter" ("address") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IndexerState" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "lastBlock" INTEGER NOT NULL DEFAULT 0
);

-- CreateIndex
CREATE INDEX "Bet_bettor_idx" ON "Bet"("bettor");

-- CreateIndex
CREATE UNIQUE INDEX "Bet_sessionId_bettor_key" ON "Bet"("sessionId", "bettor");

-- CreateIndex
CREATE INDEX "Challenge_opponent_status_idx" ON "Challenge"("opponent", "status");
