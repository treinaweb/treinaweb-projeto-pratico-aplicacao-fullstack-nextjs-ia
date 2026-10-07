"use server";

import { revalidatePath } from "next/cache";
import type { ZodError } from "zod";

import { requireSession } from "@/lib/auth/session";
import {
  courseSchema,
  educationSchema,
  languageSchema,
  personalInfoSchema,
  profileLinkSchema,
  projectSchema,
  skillSchema,
  workExperienceSchema,
} from "@/lib/validation/profile";
import { updatePersonalInfo as updatePersonalInfoRepo } from "@/lib/db/repositories/candidate-profile";
import {
  createWorkExperience as createWorkExperienceRepo,
  updateWorkExperience as updateWorkExperienceRepo,
  removeWorkExperience as removeWorkExperienceRepo,
} from "@/lib/db/repositories/work-experience";
import {
  createEducation as createEducationRepo,
  updateEducation as updateEducationRepo,
  removeEducation as removeEducationRepo,
} from "@/lib/db/repositories/education";
import {
  createCourse as createCourseRepo,
  updateCourse as updateCourseRepo,
  removeCourse as removeCourseRepo,
} from "@/lib/db/repositories/courses";
import {
  createProject as createProjectRepo,
  updateProject as updateProjectRepo,
  removeProject as removeProjectRepo,
} from "@/lib/db/repositories/projects";
import {
  createProfileLink as createProfileLinkRepo,
  updateProfileLink as updateProfileLinkRepo,
  removeProfileLink as removeProfileLinkRepo,
} from "@/lib/db/repositories/links";
import {
  createSkill as createSkillRepo,
  updateSkill as updateSkillRepo,
  removeSkill as removeSkillRepo,
} from "@/lib/db/repositories/skills";
import {
  createLanguage as createLanguageRepo,
  updateLanguage as updateLanguageRepo,
  removeLanguage as removeLanguageRepo,
} from "@/lib/db/repositories/languages";

export type ActionState =
  | {
      error?: string;
      fieldErrors?: Record<string, string>;
    }
  | undefined;

function fieldErrorsFromZod(error: ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !errors[key]) {
      errors[key] = issue.message;
    }
  }
  return errors;
}

const NOT_FOUND_ERROR = "Registro não encontrado.";

// Personal info

export async function updatePersonalInfo(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireSession();

  const result = personalInfoSchema.safeParse({
    headline: formData.get("headline"),
    phone: formData.get("phone"),
    location: formData.get("location"),
    summary: formData.get("summary"),
  });

  if (!result.success) {
    return { fieldErrors: fieldErrorsFromZod(result.error) };
  }

  await updatePersonalInfoRepo(session.user.id, result.data);
  revalidatePath("/profile");
}

// Work experience

export async function createWorkExperience(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireSession();

  const result = workExperienceSchema.safeParse({
    company: formData.get("company"),
    role: formData.get("role"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    description: formData.get("description"),
  });

  if (!result.success) {
    return { fieldErrors: fieldErrorsFromZod(result.error) };
  }

  await createWorkExperienceRepo(session.user.id, result.data);
  revalidatePath("/profile");
}

export async function updateWorkExperience(
  id: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireSession();

  const result = workExperienceSchema.safeParse({
    company: formData.get("company"),
    role: formData.get("role"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    description: formData.get("description"),
  });

  if (!result.success) {
    return { fieldErrors: fieldErrorsFromZod(result.error) };
  }

  const updated = await updateWorkExperienceRepo(
    session.user.id,
    id,
    result.data,
  );
  if (!updated) {
    return { error: NOT_FOUND_ERROR };
  }
  revalidatePath("/profile");
}

export async function deleteWorkExperience(id: string) {
  const session = await requireSession();
  await removeWorkExperienceRepo(session.user.id, id);
  revalidatePath("/profile");
}

// Education

export async function createEducation(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireSession();

  const result = educationSchema.safeParse({
    institution: formData.get("institution"),
    degree: formData.get("degree"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
  });

  if (!result.success) {
    return { fieldErrors: fieldErrorsFromZod(result.error) };
  }

  await createEducationRepo(session.user.id, result.data);
  revalidatePath("/profile");
}

export async function updateEducation(
  id: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireSession();

  const result = educationSchema.safeParse({
    institution: formData.get("institution"),
    degree: formData.get("degree"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
  });

  if (!result.success) {
    return { fieldErrors: fieldErrorsFromZod(result.error) };
  }

  const updated = await updateEducationRepo(session.user.id, id, result.data);
  if (!updated) {
    return { error: NOT_FOUND_ERROR };
  }
  revalidatePath("/profile");
}

export async function deleteEducation(id: string) {
  const session = await requireSession();
  await removeEducationRepo(session.user.id, id);
  revalidatePath("/profile");
}

// Courses

export async function createCourse(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireSession();

  const result = courseSchema.safeParse({
    name: formData.get("name"),
    institution: formData.get("institution"),
    completedAt: formData.get("completedAt"),
    workloadHours: formData.get("workloadHours"),
  });

  if (!result.success) {
    return { fieldErrors: fieldErrorsFromZod(result.error) };
  }

  await createCourseRepo(session.user.id, result.data);
  revalidatePath("/profile");
}

export async function updateCourse(
  id: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireSession();

  const result = courseSchema.safeParse({
    name: formData.get("name"),
    institution: formData.get("institution"),
    completedAt: formData.get("completedAt"),
    workloadHours: formData.get("workloadHours"),
  });

  if (!result.success) {
    return { fieldErrors: fieldErrorsFromZod(result.error) };
  }

  const updated = await updateCourseRepo(session.user.id, id, result.data);
  if (!updated) {
    return { error: NOT_FOUND_ERROR };
  }
  revalidatePath("/profile");
}

export async function deleteCourse(id: string) {
  const session = await requireSession();
  await removeCourseRepo(session.user.id, id);
  revalidatePath("/profile");
}

// Projects

export async function createProject(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireSession();

  const result = projectSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    link: formData.get("link"),
  });

  if (!result.success) {
    return { fieldErrors: fieldErrorsFromZod(result.error) };
  }

  await createProjectRepo(session.user.id, result.data);
  revalidatePath("/profile");
}

export async function updateProject(
  id: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireSession();

  const result = projectSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    link: formData.get("link"),
  });

  if (!result.success) {
    return { fieldErrors: fieldErrorsFromZod(result.error) };
  }

  const updated = await updateProjectRepo(session.user.id, id, result.data);
  if (!updated) {
    return { error: NOT_FOUND_ERROR };
  }
  revalidatePath("/profile");
}

export async function deleteProject(id: string) {
  const session = await requireSession();
  await removeProjectRepo(session.user.id, id);
  revalidatePath("/profile");
}

// Links

export async function createLink(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireSession();

  const result = profileLinkSchema.safeParse({
    label: formData.get("label"),
    url: formData.get("url"),
  });

  if (!result.success) {
    return { fieldErrors: fieldErrorsFromZod(result.error) };
  }

  await createProfileLinkRepo(session.user.id, result.data);
  revalidatePath("/profile");
}

export async function updateLink(
  id: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireSession();

  const result = profileLinkSchema.safeParse({
    label: formData.get("label"),
    url: formData.get("url"),
  });

  if (!result.success) {
    return { fieldErrors: fieldErrorsFromZod(result.error) };
  }

  const updated = await updateProfileLinkRepo(
    session.user.id,
    id,
    result.data,
  );
  if (!updated) {
    return { error: NOT_FOUND_ERROR };
  }
  revalidatePath("/profile");
}

export async function deleteLink(id: string) {
  const session = await requireSession();
  await removeProfileLinkRepo(session.user.id, id);
  revalidatePath("/profile");
}

// Skills

export async function createSkill(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireSession();

  const result = skillSchema.safeParse({
    name: formData.get("name"),
  });

  if (!result.success) {
    return { fieldErrors: fieldErrorsFromZod(result.error) };
  }

  await createSkillRepo(session.user.id, result.data);
  revalidatePath("/profile");
}

export async function updateSkill(
  id: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireSession();

  const result = skillSchema.safeParse({
    name: formData.get("name"),
  });

  if (!result.success) {
    return { fieldErrors: fieldErrorsFromZod(result.error) };
  }

  const updated = await updateSkillRepo(session.user.id, id, result.data);
  if (!updated) {
    return { error: NOT_FOUND_ERROR };
  }
  revalidatePath("/profile");
}

export async function deleteSkill(id: string) {
  const session = await requireSession();
  await removeSkillRepo(session.user.id, id);
  revalidatePath("/profile");
}

// Languages

export async function createLanguage(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireSession();

  const result = languageSchema.safeParse({
    name: formData.get("name"),
    proficiency: formData.get("proficiency"),
  });

  if (!result.success) {
    return { fieldErrors: fieldErrorsFromZod(result.error) };
  }

  await createLanguageRepo(session.user.id, result.data);
  revalidatePath("/profile");
}

export async function updateLanguage(
  id: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireSession();

  const result = languageSchema.safeParse({
    name: formData.get("name"),
    proficiency: formData.get("proficiency"),
  });

  if (!result.success) {
    return { fieldErrors: fieldErrorsFromZod(result.error) };
  }

  const updated = await updateLanguageRepo(session.user.id, id, result.data);
  if (!updated) {
    return { error: NOT_FOUND_ERROR };
  }
  revalidatePath("/profile");
}

export async function deleteLanguage(id: string) {
  const session = await requireSession();
  await removeLanguageRepo(session.user.id, id);
  revalidatePath("/profile");
}
