import { prisma } from "@/lib/db/client";
import { getOrCreateProfile } from "@/lib/db/repositories/candidate-profile";

export type SkillInput = {
  name: string;
};

export async function listSkills(userId: string) {
  return prisma.skill.findMany({
    where: { profile: { userId } },
    orderBy: { createdAt: "desc" },
  });
}

export async function createSkill(userId: string, data: SkillInput) {
  const profile = await getOrCreateProfile(userId);
  return prisma.skill.create({
    data: { ...data, profileId: profile.id },
  });
}

export async function updateSkill(
  userId: string,
  id: string,
  data: Partial<SkillInput>,
) {
  const result = await prisma.skill.updateMany({
    where: { id, profile: { userId } },
    data,
  });
  return result.count > 0;
}

export async function removeSkill(userId: string, id: string) {
  const result = await prisma.skill.deleteMany({
    where: { id, profile: { userId } },
  });
  return result.count > 0;
}
