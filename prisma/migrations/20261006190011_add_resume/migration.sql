-- CreateTable
CREATE TABLE "resume" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobPostingId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resume_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "resume_userId_createdAt_idx" ON "resume"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "resume_jobPostingId_idx" ON "resume"("jobPostingId");

-- AddForeignKey
ALTER TABLE "resume" ADD CONSTRAINT "resume_jobPostingId_fkey" FOREIGN KEY ("jobPostingId") REFERENCES "job_posting"("id") ON DELETE CASCADE ON UPDATE CASCADE;
