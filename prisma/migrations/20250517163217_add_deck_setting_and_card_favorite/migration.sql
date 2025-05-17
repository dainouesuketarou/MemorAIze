-- CreateEnum
CREATE TYPE "FilterMode" AS ENUM ('ALL', 'UNLEARNED', 'MASTERED', 'STRUGGLING', 'FAVORITE');

-- AlterTable
ALTER TABLE "Card" ADD COLUMN     "favorite" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "DeckSetting" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deckId" TEXT NOT NULL,
    "autoSpeak" BOOLEAN NOT NULL DEFAULT false,
    "reverse" BOOLEAN NOT NULL DEFAULT false,
    "filterMode" "FilterMode" NOT NULL DEFAULT 'ALL',
    "shuffle" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeckSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeckSetting_userId_deckId_key" ON "DeckSetting"("userId", "deckId");

-- AddForeignKey
ALTER TABLE "DeckSetting" ADD CONSTRAINT "DeckSetting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeckSetting" ADD CONSTRAINT "DeckSetting_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "Deck"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
