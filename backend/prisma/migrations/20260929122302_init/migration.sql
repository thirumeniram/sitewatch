-- CreateEnum
CREATE TYPE "WebsiteStatus" AS ENUM ('UP', 'DOWN', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "CheckStatus" AS ENUM ('UP', 'DOWN');

-- CreateEnum
CREATE TYPE "IncidentStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "status_page_slug" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Website" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "check_interval_minutes" INTEGER NOT NULL,
    "current_status" "WebsiteStatus" NOT NULL DEFAULT 'UNKNOWN',
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Website_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Check" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "website_id" UUID NOT NULL,
    "status" "CheckStatus" NOT NULL,
    "status_code" INTEGER,
    "response_time_ms" INTEGER,
    "error_message" TEXT,
    "checked_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Check_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CheckHourly" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "website_id" UUID NOT NULL,
    "hour_start" TIMESTAMPTZ(3) NOT NULL,
    "total_checks" INTEGER NOT NULL,
    "failed_checks" INTEGER NOT NULL,
    "average_response_time_ms" INTEGER,

    CONSTRAINT "CheckHourly_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Incident" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "website_id" UUID NOT NULL,
    "status" "IncidentStatus" NOT NULL DEFAULT 'OPEN',
    "started_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMPTZ(3),
    "failure_reason" TEXT,
    "summary" TEXT,
    "opened_email_sent_at" TIMESTAMPTZ(3),
    "closed_email_sent_at" TIMESTAMPTZ(3),

    CONSTRAINT "Incident_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_status_page_slug_key" ON "User"("status_page_slug");

-- CreateIndex
CREATE INDEX "Website_user_id_idx" ON "Website"("user_id");

-- CreateIndex
CREATE INDEX "Check_website_id_checked_at_idx" ON "Check"("website_id", "checked_at");

-- CreateIndex
CREATE INDEX "Check_checked_at_idx" ON "Check"("checked_at");

-- CreateIndex
CREATE INDEX "CheckHourly_hour_start_idx" ON "CheckHourly"("hour_start");

-- CreateIndex
CREATE UNIQUE INDEX "CheckHourly_website_id_hour_start_key" ON "CheckHourly"("website_id", "hour_start");

-- CreateIndex
CREATE INDEX "Incident_website_id_started_at_idx" ON "Incident"("website_id", "started_at");

-- AddForeignKey
ALTER TABLE "Website" ADD CONSTRAINT "Website_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Check" ADD CONSTRAINT "Check_website_id_fkey" FOREIGN KEY ("website_id") REFERENCES "Website"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckHourly" ADD CONSTRAINT "CheckHourly_website_id_fkey" FOREIGN KEY ("website_id") REFERENCES "Website"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_website_id_fkey" FOREIGN KEY ("website_id") REFERENCES "Website"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- EnableRowLevelSecurity
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Website" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Check" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CheckHourly" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Incident" ENABLE ROW LEVEL SECURITY;
