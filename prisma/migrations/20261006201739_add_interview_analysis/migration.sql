-- CreateTable
CREATE TABLE "interview_analysis" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interview_analysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "interview_analysis_sessionId_key" ON "interview_analysis"("sessionId");

-- AddForeignKey
ALTER TABLE "interview_analysis" ADD CONSTRAINT "interview_analysis_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "interview_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;
