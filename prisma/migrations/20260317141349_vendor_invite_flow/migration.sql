-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "inviteSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false;
