/*
  Warnings:

  - A unique constraint covering the columns `[shareCode]` on the table `Deck` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Deck" ADD COLUMN     "shareCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Deck_shareCode_key" ON "Deck"("shareCode");
