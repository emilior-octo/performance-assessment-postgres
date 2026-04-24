-- AlterTable
ALTER TABLE "AssessmentResult" ADD COLUMN     "expandedReportGeneratedAt" TIMESTAMP(3),
ADD COLUMN     "expandedReportJson" JSONB,
ADD COLUMN     "reliabilityLabel" TEXT,
ADD COLUMN     "reliabilityScore" INTEGER;
