import { prisma } from "@/lib/db/client";
import { getOrCreateProfile } from "@/lib/db/repositories/candidate-profile";
import type { LanguageProficiency } from "@/lib/generated/prisma/enums";

export type LanguageInput = {
  name: string;
  proficiency: LanguageProficiency;
};

export async function listLanguages(userId: string) {
  return prisma.language.findMany({
    where: { profile: { userId } },
    orderBy: { createdAt: "desc" },
  });
}

export async function createLanguage(userId: string, data: LanguageInput) {
  const profile = await getOrCreateProfile(userId);
  return prisma.language.create({
    data: { ...data, profileId: profile.id },
  });
}

export async function updateLanguage(
  userId: string,
  id: string,
  data: Partial<LanguageInput>,
) {
  const result = await prisma.language.updateMany({
    where: { id, profile: { userId } },
    data,
  });
  return result.count > 0;
}

export async function removeLanguage(userId: string, id: string) {
  const result = await prisma.language.deleteMany({
    where: { id, profile: { userId } },
  });
  return result.count > 0;
}
