-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "gstNumber" TEXT,
ADD COLUMN     "licenseUrl" TEXT,
ADD COLUMN     "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "profileCompleted" BOOLEAN NOT NULL DEFAULT false;
