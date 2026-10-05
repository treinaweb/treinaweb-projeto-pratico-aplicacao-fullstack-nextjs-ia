import { prisma } from "@/lib/db/client";

export async function getOrCreateProfile(userId: string) {
  const existing = await prisma.candidateProfile.findUnique({
    where: { userId },
  });

  if (existing) {
    return existing;
  }

  return prisma.candidateProfile.create({
    data: { userId },
  });
}

export async function updatePersonalInfo(
  userId: string,
  data: {
    headline?: string | null;
    phone?: string | null;
    location?: string | null;
    summary?: string | null;
  },
) {
  const profile = await getOrCreateProfile(userId);

  return prisma.candidateProfile.update({
    where: { id: profile.id },
    data,
  });
}
