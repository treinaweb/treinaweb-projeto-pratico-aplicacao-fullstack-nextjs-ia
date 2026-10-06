"use server";

import { createIdGenerator } from "ai";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireSession } from "@/lib/auth/session";
import {
  buildInterviewContext,
  writeOpeningMessage,
} from "@/lib/ai/interviewer";
import {
  completeInterview,
  createInterview,
} from "@/lib/db/repositories/interviews";
import { getResume } from "@/lib/db/repositories/resumes";
import { getJobPosting } from "@/lib/db/repositories/job-postings";
import { startInterviewSchema } from "@/lib/validation/interview";

export type StartInterviewState = { error?: string } | undefined;

const START_ERROR = "Não foi possível iniciar a entrevista. Tente novamente.";
const NOT_FOUND_ERROR = "Currículo não encontrado.";

const generateMessageId = createIdGenerator({ prefix: "msg", size: 16 });

export async function startInterviewAction(
  _prevState: StartInterviewState,
  formData: FormData,
): Promise<StartInterviewState> {
  const session = await requireSession();
  const userId = session.user.id;

  const result = startInterviewSchema.safeParse({
    resumeId: formData.get("resumeId"),
  });
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const resume = await getResume(userId, result.data.resumeId);
  const posting = resume && (await getJobPosting(userId, resume.jobPostingId));
  if (!resume || !posting) {
    return { error: NOT_FOUND_ERROR };
  }

  let interviewId: string;
  try {
    const context = buildInterviewContext(resume.content, posting);
    const opening = await writeOpeningMessage(context);
    const interview = await createInterview(userId, resume.id, context.language, {
      id: generateMessageId(),
      content: opening,
    });
    interviewId = interview.id;
  } catch (error) {
    console.error("Interview start failed", error);
    return { error: START_ERROR };
  }

  revalidatePath("/interviews");
  redirect(`/interviews/${interviewId}`);
}

export async function endInterviewAction(id: string) {
  const session = await requireSession();
  const ended = await completeInterview(session.user.id, id);
  revalidatePath("/interviews");
  revalidatePath(`/interviews/${id}`);
  return { ended };
}
