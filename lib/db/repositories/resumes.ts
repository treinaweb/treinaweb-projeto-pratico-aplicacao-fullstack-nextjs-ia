import { prisma } from "@/lib/db/client";
import {
  resumeContentSchema,
  type ResumeContent,
} from "@/lib/validation/resume";

export async function createResume(
  userId: string,
  jobPostingId: string,
  content: ResumeContent,
) {
  return prisma.resume.create({
    data: { userId, jobPostingId, language: content.language, content },
  });
}

export async function listResumes(userId: string) {
  return prisma.resume.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      language: true,
      createdAt: true,
      jobPosting: { select: { title: true, company: true } },
    },
  });
}

export async function getResume(userId: string, id: string) {
  const resume = await prisma.resume.findFirst({
    where: { id, userId },
    include: { jobPosting: { select: { title: true, company: true } } },
  });
  if (!resume) return null;

  return { ...resume, content: resumeContentSchema.parse(resume.content) };
}
