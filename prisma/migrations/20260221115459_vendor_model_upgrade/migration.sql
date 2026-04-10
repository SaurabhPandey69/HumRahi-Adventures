-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "capacity" INTEGER,
ADD COLUMN     "contactEmail" TEXT,
ADD COLUMN     "contactName" TEXT,
ADD COLUMN     "contactPhone" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isFullPackageProvider" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "pricePerPerson" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "serviceTypes" JSONB;
