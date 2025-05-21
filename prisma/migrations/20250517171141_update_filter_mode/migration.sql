/*
  Warnings:

  - The values [ALL] on the enum `FilterMode` will be removed. If these variants are still used in the database, this will fail.
  - Changed the column `filterMode` on the `DeckSetting` table from a scalar field to a list field. If there are non-null values in that column, this step will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "FilterMode_new" AS ENUM ('UNLEARNED', 'MASTERED', 'STRUGGLING', 'FAVORITE');
ALTER TABLE "DeckSetting" ALTER COLUMN "filterMode" DROP DEFAULT;
ALTER TABLE "DeckSetting" ALTER COLUMN "filterMode" TYPE "FilterMode_new"[] USING ("filterMode"::text::"FilterMode_new"[]);
ALTER TYPE "FilterMode" RENAME TO "FilterMode_old";
ALTER TYPE "FilterMode_new" RENAME TO "FilterMode";
DROP TYPE "FilterMode_old";
ALTER TABLE "DeckSetting" ALTER COLUMN "filterMode" SET DEFAULT ARRAY[]::"FilterMode"[];
COMMIT;

-- AlterTable
ALTER TABLE "DeckSetting" ALTER COLUMN "filterMode" SET DEFAULT ARRAY[]::"FilterMode"[],
ALTER COLUMN "filterMode" SET DATA TYPE "FilterMode"[];
