"use server";

import { createIdGenerator, type UIMessage } from "ai";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireSession } from "@/lib/auth/session";
import {
  buildInterviewContext,
  writeOpeningMessage,
} from "@/lib/ai/interviewer";
import {
  analyzeInterview,
  type TranscriptTurn,
} from "@/lib/ai/interview-analyzer";
import {
  createInterviewAnalysis,
  getInterviewAnalysis,
} from "@/lib/db/repositories/interview-analyses";
import { assembleInterviewAnalysis } from "@/lib/interview-analysis/assemble";
import { analysisLanguage } from "@/lib/interview-analysis/labels";
import {
  completeInterview,
  createInterview,
  getInterview,
} from "@/lib/db/repositories/interviews";
import { getResume } from "@/lib/db/repositories/resumes";
import { getJobPosting } from "@/lib/db/repositories/job-postings";
import { startInterviewSchema } from "@/lib/validation/interview";
import { resumeContentSchema } from "@/lib/validation/resume";

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

export type GenerateAnalysisState = { error?: string } | undefined;

const ANALYSIS_ERROR = "Não foi possível gerar a análise. Tente novamente.";
const NO_ANSWERS_ERROR =
  "Esta entrevista não tem respostas suas para analisar.";

const messageText = (message: UIMessage) =>
  message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("");

// Pairs each candidate answer with the interviewer message right before it.
function buildTranscript(messages: UIMessage[]): TranscriptTurn[] {
  const turns: TranscriptTurn[] = [];
  messages.forEach((message, index) => {
    if (message.role !== "user") return;
    const previous = messages[index - 1];
    turns.push({
      question: previous?.role === "assistant" ? messageText(previous) : "",
      answer: { id: message.id, text: messageText(message) },
    });
  });
  return turns;
}

// Bound to an interview id and used with useActionState (previous state unused).
export async function generateAnalysisAction(
  interviewId: string,
): Promise<GenerateAnalysisState> {
  const session = await requireSession();
  const userId = session.user.id;

  const interview = await getInterview(userId, interviewId);
  if (!interview) {
    return { error: "Entrevista não encontrada." };
  }
  if (interview.status !== "COMPLETED") {
    return { error: "Conclua a entrevista antes de gerar a análise." };
  }
  if (await getInterviewAnalysis(userId, interview.id)) {
    revalidatePath(`/interviews/${interview.id}`);
    return;
  }

  const transcript = buildTranscript(interview.messages);
  if (transcript.length === 0) {
    return { error: NO_ANSWERS_ERROR };
  }

  try {
    const draft = await analyzeInterview({
      language: analysisLanguage(interview.language),
      posting: interview.resume.jobPosting,
      resume: resumeContentSchema.parse(interview.resume.content),
      transcript,
    });
    const content = assembleInterviewAnalysis({
      draft,
      answerIds: transcript.map((turn) => turn.answer.id),
    });
    await createInterviewAnalysis(interview.id, content);
  } catch (error) {
    console.error("Interview analysis failed", error);
    return { error: ANALYSIS_ERROR };
  }

  revalidatePath(`/interviews/${interview.id}`);
  revalidatePath("/interviews");
}
