import { prisma } from "@/lib/db/client";
import { interviewAnalysisContentSchema } from "@/lib/validation/interview-analysis";
import type { DashboardSummary } from "@/lib/dashboard/types";

const posting = { select: { title: true, company: true } } as const;

// Read-only: unlike getOrCreateProfile, a missing profile is reported as empty.
export async function getDashboardSummary(
  userId: string,
): Promise<DashboardSummary> {
  const [profile, jobPostings, resumes, interviews] = await Promise.all([
    prisma.candidateProfile.findUnique({
      where: { userId },
      select: {
        headline: true,
        summary: true,
        _count: {
          select: {
            workExperiences: true,
            educations: true,
            courses: true,
            projects: true,
            links: true,
            skills: true,
            languages: true,
          },
        },
      },
    }),
    prisma.jobPosting.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        company: true,
        createdAt: true,
        _count: { select: { resumes: true } },
      },
    }),
    prisma.resume.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        jobPosting: posting,
        _count: { select: { interviews: true } },
      },
    }),
    prisma.interviewSession.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        createdAt: true,
        completedAt: true,
        resume: { select: { jobPosting: posting } },
        _count: { select: { messages: { where: { role: "CANDIDATE" } } } },
        analysis: {
          select: { overallScore: true, content: true, createdAt: true },
        },
      },
    }),
  ]);

  return {
    profile: {
      hasHeadline: Boolean(profile?.headline?.trim()),
      hasSummary: Boolean(profile?.summary?.trim()),
      counts: {
        workExperiences: profile?._count.workExperiences ?? 0,
        educations: profile?._count.educations ?? 0,
        courses: profile?._count.courses ?? 0,
        projects: profile?._count.projects ?? 0,
        links: profile?._count.links ?? 0,
        skills: profile?._count.skills ?? 0,
        languages: profile?._count.languages ?? 0,
      },
    },
    jobPostings: jobPostings.map(({ _count, ...jobPosting }) => ({
      ...jobPosting,
      resumeCount: _count.resumes,
    })),
    resumes: resumes.map((resume) => ({
      id: resume.id,
      createdAt: resume.createdAt,
      posting: resume.jobPosting,
      interviewCount: resume._count.interviews,
    })),
    interviews: interviews.map((interview) => {
      const parsed = interview.analysis
        ? interviewAnalysisContentSchema.safeParse(interview.analysis.content)
        : null;
      return {
        id: interview.id,
        status: interview.status,
        createdAt: interview.createdAt,
        completedAt: interview.completedAt,
        posting: interview.resume.jobPosting,
        hasAnswers: interview._count.messages > 0,
        analysis: interview.analysis && {
          overallScore: interview.analysis.overallScore,
          criteria: parsed?.success ? parsed.data.criteria : null,
          createdAt: interview.analysis.createdAt,
        },
      };
    }),
  };
}
