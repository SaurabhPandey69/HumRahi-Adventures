/*
  Warnings:

  - A unique constraint covering the columns `[vendorId,date]` on the table `VendorAvailability` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "VendorAvailability_vendorId_date_key" ON "VendorAvailability"("vendorId", "date");
