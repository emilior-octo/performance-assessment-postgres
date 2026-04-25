-- AlterTable
ALTER TABLE "Assessment" ADD COLUMN     "candidateCompany" TEXT;

-- AlterTable
ALTER TABLE "AssessmentResult" ADD COLUMN     "answersJson" JSONB;
