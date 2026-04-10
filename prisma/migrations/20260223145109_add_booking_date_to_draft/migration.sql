/*
  Warnings:

  - Added the required column `bookingDate` to the `BookingDraft` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BookingDraft" ADD COLUMN     "bookingDate" TIMESTAMP(3) NOT NULL;
