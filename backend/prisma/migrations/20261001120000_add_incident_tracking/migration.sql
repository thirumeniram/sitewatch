-- AlterTable
ALTER TABLE "Website" ADD COLUMN     "consecutive_failures" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "Incident_one_open_per_website" ON "Incident"("website_id") WHERE (status = 'OPEN');

