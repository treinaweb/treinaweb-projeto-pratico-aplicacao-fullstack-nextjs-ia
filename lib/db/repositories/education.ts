import { prisma } from "@/lib/db/client";
import { getOrCreateProfile } from "@/lib/db/repositories/candidate-profile";

export type EducationInput = {
  institution: string;
  degree: string;
  startDate: Date;
  endDate?: Date | null;
};

export async function listEducations(userId: string) {
  return prisma.education.findMany({
    where: { profile: { userId } },
    orderBy: { startDate: "desc" },
  });
}

export async function createEducation(userId: string, data: EducationInput) {
  const profile = await getOrCreateProfile(userId);
  return prisma.education.create({
    data: { ...data, profileId: profile.id },
  });
}

export async function updateEducation(
  userId: string,
  id: string,
  data: Partial<EducationInput>,
) {
  const result = await prisma.education.updateMany({
    where: { id, profile: { userId } },
    data,
  });
  return result.count > 0;
}

export async function removeEducation(userId: string, id: string) {
  const result = await prisma.education.deleteMany({
    where: { id, profile: { userId } },
  });
  return result.count > 0;
}
