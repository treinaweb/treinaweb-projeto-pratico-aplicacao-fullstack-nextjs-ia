-- CreateEnum
CREATE TYPE "JobWorkModel" AS ENUM ('REMOTE', 'HYBRID', 'ONSITE');

-- CreateTable
CREATE TABLE "job_posting" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT,
    "location" TEXT,
    "workModel" "JobWorkModel",
    "employmentType" TEXT,
    "seniority" TEXT,
    "salary" TEXT,
    "summary" TEXT,
    "responsibilities" TEXT[],
    "requirements" TEXT[],
    "niceToHave" TEXT[],
    "benefits" TEXT[],
    "rawText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_posting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "job_posting_userId_createdAt_idx" ON "job_posting"("userId", "createdAt");
