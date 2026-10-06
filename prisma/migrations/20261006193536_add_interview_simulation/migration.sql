-- CreateEnum
CREATE TYPE "InterviewStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "InterviewRole" AS ENUM ('INTERVIEWER', 'CANDIDATE');

-- CreateTable
CREATE TABLE "interview_session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "status" "InterviewStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "questionCount" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "interview_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_message" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "role" "InterviewRole" NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interview_message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "interview_session_userId_createdAt_idx" ON "interview_session"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "interview_session_resumeId_idx" ON "interview_session"("resumeId");

-- CreateIndex
CREATE INDEX "interview_message_sessionId_createdAt_idx" ON "interview_message"("sessionId", "createdAt");

-- AddForeignKey
ALTER TABLE "interview_session" ADD CONSTRAINT "interview_session_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_message" ADD CONSTRAINT "interview_message_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "interview_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;
