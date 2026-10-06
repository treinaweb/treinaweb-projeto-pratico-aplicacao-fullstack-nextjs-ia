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

// Profile with every list, ordered as on /profile. Used to generate resumes.
export async function getFullProfile(userId: string) {
  const profile = await getOrCreateProfile(userId);

  return prisma.candidateProfile.findUniqueOrThrow({
    where: { id: profile.id },
    include: {
      workExperiences: { orderBy: { startDate: "desc" } },
      educations: { orderBy: { startDate: "desc" } },
      courses: { orderBy: { createdAt: "desc" } },
      projects: { orderBy: { createdAt: "desc" } },
      links: { orderBy: { createdAt: "desc" } },
      skills: { orderBy: { createdAt: "desc" } },
      languages: { orderBy: { createdAt: "desc" } },
    },
  });
}

export type FullProfile = Awaited<ReturnType<typeof getFullProfile>>;
