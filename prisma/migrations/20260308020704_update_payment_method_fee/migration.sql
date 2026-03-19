/*
  Warnings:

  - Added the required column `feePercent` to the `PaymentMethodFee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `label` to the `PaymentMethodFee` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PaymentMethodFee" ADD COLUMN     "feePercent" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "label" TEXT NOT NULL,
ADD COLUMN     "maxFee" INTEGER,
ADD COLUMN     "minFee" INTEGER,
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0;
