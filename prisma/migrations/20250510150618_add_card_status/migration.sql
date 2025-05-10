/*
  Warnings:

  - You are about to drop the column `mastered` on the `Card` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "CardStatus" AS ENUM ('UNLEARNED', 'MASTERED', 'STRUGGLING');

-- AlterTable
ALTER TABLE "Card" DROP COLUMN "mastered",
ADD COLUMN     "status" "CardStatus" NOT NULL DEFAULT 'UNLEARNED';

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
