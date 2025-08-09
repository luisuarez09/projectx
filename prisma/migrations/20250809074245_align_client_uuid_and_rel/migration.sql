/*
  Warnings:

  - The primary key for the `Client` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `updatedAt` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `Client` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "public"."Client" DROP CONSTRAINT "Client_pkey",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "Client_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "public"."Estimate" (
    "id" SERIAL NOT NULL,
    "number" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "clientId" UUID NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "exchangeRate" DECIMAL(18,6),
    "notes" TEXT,
    "taxRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "discountRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "subtotal" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "taxAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "discountAmt" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Estimate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EstimateItem" (
    "id" SERIAL NOT NULL,
    "estimateId" INTEGER NOT NULL,
    "idx" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "qty" DECIMAL(18,4) NOT NULL,
    "unit" TEXT,
    "unitPrice" DECIMAL(18,2) NOT NULL,
    "lineTotal" DECIMAL(18,2) NOT NULL,

    CONSTRAINT "EstimateItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Estimate" ADD CONSTRAINT "Estimate_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EstimateItem" ADD CONSTRAINT "EstimateItem_estimateId_fkey" FOREIGN KEY ("estimateId") REFERENCES "public"."Estimate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
