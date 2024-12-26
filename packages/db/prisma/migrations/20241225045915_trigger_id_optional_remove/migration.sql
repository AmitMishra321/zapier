/*
  Warnings:

  - Made the column `triggerId` on table `Zap` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Zap" ALTER COLUMN "triggerId" SET NOT NULL;
