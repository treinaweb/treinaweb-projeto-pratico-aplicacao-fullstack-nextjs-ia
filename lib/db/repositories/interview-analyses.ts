import { prisma } from "@/lib/db/client";
import { Prisma } from "@/lib/generated/prisma/client";
import {
  interviewAnalysisContentSchema,
  type InterviewAnalysisContent,
} from "@/lib/validation/interview-analysis";

export async function getInterviewAnalysis(userId: string, sessionId: string) {
  const analysis = await prisma.interviewAnalysis.findFirst({
    where: { sessionId, session: { userId } },
  });
  if (!analysis) return null;

  return {
    ...analysis,
    content: interviewAnalysisContentSchema.parse(analysis.content),
  };
}

// One analysis per interview: a concurrent duplicate hits the unique key on
// `sessionId`, and the existing row is returned instead.
export async function createInterviewAnalysis(
  sessionId: string,
  content: InterviewAnalysisContent,
) {
  try {
    return await prisma.interviewAnalysis.create({
      data: { sessionId, overallScore: content.overallScore, content },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return prisma.interviewAnalysis.findUniqueOrThrow({
        where: { sessionId },
      });
    }
    throw error;
  }
}
