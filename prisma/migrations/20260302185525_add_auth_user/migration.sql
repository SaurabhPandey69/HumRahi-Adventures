/*
  Warnings:

  - A unique constraint covering the columns `[authUserId]` on the table `Vendor` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `authUserId` to the `Vendor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "authUserId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_authUserId_key" ON "Vendor"("authUserId");
