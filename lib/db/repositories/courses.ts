import { prisma } from "@/lib/db/client";
import { getOrCreateProfile } from "@/lib/db/repositories/candidate-profile";

export type CourseInput = {
  name: string;
  institution?: string | null;
  completedAt?: Date | null;
  workloadHours?: number | null;
};

export async function listCourses(userId: string) {
  return prisma.course.findMany({
    where: { profile: { userId } },
    orderBy: { createdAt: "desc" },
  });
}

export async function createCourse(userId: string, data: CourseInput) {
  const profile = await getOrCreateProfile(userId);
  return prisma.course.create({
    data: { ...data, profileId: profile.id },
  });
}

export async function updateCourse(
  userId: string,
  id: string,
  data: Partial<CourseInput>,
) {
  const result = await prisma.course.updateMany({
    where: { id, profile: { userId } },
    data,
  });
  return result.count > 0;
}

export async function removeCourse(userId: string, id: string) {
  const result = await prisma.course.deleteMany({
    where: { id, profile: { userId } },
  });
  return result.count > 0;
}
