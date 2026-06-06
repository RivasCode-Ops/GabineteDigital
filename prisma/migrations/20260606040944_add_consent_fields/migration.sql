-- AlterTable
ALTER TABLE "people" ADD COLUMN     "consent_at" TIMESTAMP(3),
ADD COLUMN     "consent_given" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "consent_ip" VARCHAR(45),
ADD COLUMN     "consent_version" VARCHAR(10);
