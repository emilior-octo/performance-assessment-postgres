-- AlterTable
ALTER TABLE "AssessmentResult" ADD COLUMN     "generationError" TEXT,
ADD COLUMN     "isGenerating" BOOLEAN NOT NULL DEFAULT false;
