import { prisma } from "@/lib/db/client";
import type { JobPostingData } from "@/lib/validation/job-posting";

export type JobPostingInput = JobPostingData & {
  rawText: string;
};

export async function listJobPostings(userId: string) {
  return prisma.jobPosting.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, company: true, createdAt: true },
  });
}

export async function getJobPosting(userId: string, id: string) {
  return prisma.jobPosting.findFirst({
    where: { id, userId },
  });
}

export async function createJobPosting(userId: string, data: JobPostingInput) {
  return prisma.jobPosting.create({
    data: { ...data, userId },
  });
}
