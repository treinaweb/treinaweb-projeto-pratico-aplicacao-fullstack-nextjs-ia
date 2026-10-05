import { prisma } from "@/lib/db/client";
import { getOrCreateProfile } from "@/lib/db/repositories/candidate-profile";

export type ProjectInput = {
  name: string;
  description?: string | null;
  link?: string | null;
};

export async function listProjects(userId: string) {
  return prisma.project.findMany({
    where: { profile: { userId } },
    orderBy: { createdAt: "desc" },
  });
}

export async function createProject(userId: string, data: ProjectInput) {
  const profile = await getOrCreateProfile(userId);
  return prisma.project.create({
    data: { ...data, profileId: profile.id },
  });
}

export async function updateProject(
  userId: string,
  id: string,
  data: Partial<ProjectInput>,
) {
  const result = await prisma.project.updateMany({
    where: { id, profile: { userId } },
    data,
  });
  return result.count > 0;
}

export async function removeProject(userId: string, id: string) {
  const result = await prisma.project.deleteMany({
    where: { id, profile: { userId } },
  });
  return result.count > 0;
}
