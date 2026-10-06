"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireSession } from "@/lib/auth/session";
import { writeResumeDraft } from "@/lib/ai/resume-writer";
import { getFullProfile } from "@/lib/db/repositories/candidate-profile";
import { getJobPosting } from "@/lib/db/repositories/job-postings";
import { createResume } from "@/lib/db/repositories/resumes";
import {
  assembleResume,
  profileHasResumeContent,
} from "@/lib/resume/assemble";
import { generateResumeSchema } from "@/lib/validation/resume";

export type GenerateResumeState =
  | {
      error?: string;
      emptyProfile?: boolean;
    }
  | undefined;

const GENERATION_ERROR = "Não foi possível gerar o currículo. Tente novamente.";
const NOT_FOUND_ERROR = "Vaga não encontrada.";
const EMPTY_PROFILE_ERROR =
  "Seu perfil ainda não tem experiências, formações, projetos ou habilidades. Preencha seu perfil antes de gerar um currículo.";

export async function generateResumeAction(
  _prevState: GenerateResumeState,
  formData: FormData,
): Promise<GenerateResumeState> {
  const session = await requireSession();
  const userId = session.user.id;

  const result = generateResumeSchema.safeParse({
    jobPostingId: formData.get("jobPostingId"),
  });
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const posting = await getJobPosting(userId, result.data.jobPostingId);
  if (!posting) {
    return { error: NOT_FOUND_ERROR };
  }

  const profile = await getFullProfile(userId);
  if (!profileHasResumeContent(profile)) {
    return { error: EMPTY_PROFILE_ERROR, emptyProfile: true };
  }

  let resumeId: string;
  try {
    const draft = await writeResumeDraft(profile, posting);
    const content = assembleResume({
      draft,
      profile,
      user: { name: session.user.name, email: session.user.email },
    });
    const resume = await createResume(userId, posting.id, content);
    resumeId = resume.id;
  } catch (error) {
    console.error("Resume generation failed", error);
    return { error: GENERATION_ERROR };
  }

  revalidatePath("/resumes");
  redirect(`/resumes/${resumeId}`);
}
