/*
  Warnings:

  - Added the required column `condition` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."ProductCondition" AS ENUM ('POOR', 'GOOD', 'EXCELLENT');

-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "brand" TEXT,
ADD COLUMN     "color" TEXT,
ADD COLUMN     "condition" "public"."ProductCondition" NOT NULL,
ADD COLUMN     "hasManual" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasOriginalPackaging" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "height" DOUBLE PRECISION,
ADD COLUMN     "length" DOUBLE PRECISION,
ADD COLUMN     "material" TEXT,
ADD COLUMN     "model" TEXT,
ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "weight" DOUBLE PRECISION,
ADD COLUMN     "width" DOUBLE PRECISION,
ADD COLUMN     "workingConditionDescription" TEXT,
ADD COLUMN     "yearOfManufacture" INTEGER;
