import { prisma } from "@/lib/db/client";
import { getOrCreateProfile } from "@/lib/db/repositories/candidate-profile";

export type ProfileLinkInput = {
  label: string;
  url: string;
};

export async function listProfileLinks(userId: string) {
  return prisma.profileLink.findMany({
    where: { profile: { userId } },
    orderBy: { createdAt: "desc" },
  });
}

export async function createProfileLink(
  userId: string,
  data: ProfileLinkInput,
) {
  const profile = await getOrCreateProfile(userId);
  return prisma.profileLink.create({
    data: { ...data, profileId: profile.id },
  });
}

export async function updateProfileLink(
  userId: string,
  id: string,
  data: Partial<ProfileLinkInput>,
) {
  const result = await prisma.profileLink.updateMany({
    where: { id, profile: { userId } },
    data,
  });
  return result.count > 0;
}

export async function removeProfileLink(userId: string, id: string) {
  const result = await prisma.profileLink.deleteMany({
    where: { id, profile: { userId } },
  });
  return result.count > 0;
}
