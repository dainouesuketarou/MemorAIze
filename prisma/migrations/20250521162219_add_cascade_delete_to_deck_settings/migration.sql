-- DropForeignKey
ALTER TABLE "DeckSetting" DROP CONSTRAINT "DeckSetting_deckId_fkey";

-- AddForeignKey
ALTER TABLE "DeckSetting" ADD CONSTRAINT "DeckSetting_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "Deck"("id") ON DELETE CASCADE ON UPDATE CASCADE;
