import { prisma } from "@/lib/db/client";
import { getOrCreateProfile } from "@/lib/db/repositories/candidate-profile";

export type WorkExperienceInput = {
  company: string;
  role: string;
  startDate: Date;
  endDate?: Date | null;
  description?: string | null;
};

export async function listWorkExperiences(userId: string) {
  return prisma.workExperience.findMany({
    where: { profile: { userId } },
    orderBy: { startDate: "desc" },
  });
}

export async function createWorkExperience(
  userId: string,
  data: WorkExperienceInput,
) {
  const profile = await getOrCreateProfile(userId);
  return prisma.workExperience.create({
    data: { ...data, profileId: profile.id },
  });
}

export async function updateWorkExperience(
  userId: string,
  id: string,
  data: Partial<WorkExperienceInput>,
) {
  const result = await prisma.workExperience.updateMany({
    where: { id, profile: { userId } },
    data,
  });
  return result.count > 0;
}

export async function removeWorkExperience(userId: string, id: string) {
  const result = await prisma.workExperience.deleteMany({
    where: { id, profile: { userId } },
  });
  return result.count > 0;
}
