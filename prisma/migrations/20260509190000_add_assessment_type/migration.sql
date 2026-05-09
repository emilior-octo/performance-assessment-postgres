ALTER TABLE "AssessmentLink" ADD COLUMN IF NOT EXISTS "assessmentType" TEXT NOT NULL DEFAULT 'zpi_hr';
ALTER TABLE "Assessment" ADD COLUMN IF NOT EXISTS "assessmentType" TEXT NOT NULL DEFAULT 'zpi_hr';
