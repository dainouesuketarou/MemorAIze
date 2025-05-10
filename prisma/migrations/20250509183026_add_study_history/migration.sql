-- CreateTable
CREATE TABLE "StudyHistory" (
    "id" TEXT NOT NULL,
    "deckId" TEXT NOT NULL,
    "progress" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudyHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StudyHistory" ADD CONSTRAINT "StudyHistory_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "Deck"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
