-- CreateEnum
CREATE TYPE "StudyPurpose" AS ENUM ('QUALIFICATION', 'SCHOOL_EXAM', 'QUIZ_TRAINING', 'LANGUAGE_LEARNING', 'OTHER');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isOnboarded" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "UserStudyPurpose" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "purpose" "StudyPurpose" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserStudyPurpose_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserStudyPurpose_userId_purpose_key" ON "UserStudyPurpose"("userId", "purpose");

-- AddForeignKey
ALTER TABLE "UserStudyPurpose" ADD CONSTRAINT "UserStudyPurpose_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
