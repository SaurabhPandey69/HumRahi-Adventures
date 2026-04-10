-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "cancelReason" TEXT,
ADD COLUMN     "cancelRequested" BOOLEAN NOT NULL DEFAULT false;
