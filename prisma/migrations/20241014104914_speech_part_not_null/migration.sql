/*
  Warnings:

  - Made the column `speechPart` on table `Word` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Word" ALTER COLUMN "speechPart" SET NOT NULL;
