import type { UIMessage } from "ai";

import { prisma } from "@/lib/db/client";
import { INTERVIEW_QUESTION_LIMIT } from "@/lib/validation/interview";

type Exchange = {
  answer: { id: string; content: string };
  reply: { id: string; content: string };
};

function toUIMessage(message: {
  id: string;
  role: "INTERVIEWER" | "CANDIDATE";
  content: string;
}): UIMessage {
  return {
    id: message.id,
    role: message.role === "INTERVIEWER" ? "assistant" : "user",
    parts: [{ type: "text", text: message.content }],
  };
}

export async function createInterview(
  userId: string,
  resumeId: string,
  language: string,
  opening: { id: string; content: string },
) {
  return prisma.interviewSession.create({
    data: {
      userId,
      resumeId,
      language,
      messages: {
        create: { id: opening.id, role: "INTERVIEWER", content: opening.content },
      },
    },
  });
}

export async function listInterviews(userId: string) {
  return prisma.interviewSession.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      createdAt: true,
      resume: {
        select: { jobPosting: { select: { title: true, company: true } } },
      },
    },
  });
}

export async function getInterview(userId: string, id: string) {
  const session = await prisma.interviewSession.findFirst({
    where: { id, userId },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      resume: { include: { jobPosting: true } },
    },
  });
  if (!session) return null;

  const { messages, ...rest } = session;
  return { ...rest, messages: messages.map(toUIMessage) };
}

// Saves a candidate answer and the interviewer's full reply together. The
// session must still be in progress, so concurrent requests can't both save.
// Returns false when nothing was saved.
export async function appendExchange(
  userId: string,
  sessionId: string,
  { answer, reply }: Exchange,
  { complete }: { complete: boolean },
) {
  // Explicit timestamps keep answer → reply order stable within the same ms.
  const answeredAt = new Date();
  const repliedAt = new Date(answeredAt.getTime() + 1);

  return prisma.$transaction(async (tx) => {
    const updated = await tx.interviewSession.updateMany({
      where: {
        id: sessionId,
        userId,
        status: "IN_PROGRESS",
        questionCount: complete
          ? INTERVIEW_QUESTION_LIMIT
          : { lt: INTERVIEW_QUESTION_LIMIT },
      },
      data: complete
        ? { status: "COMPLETED", completedAt: repliedAt }
        : { questionCount: { increment: 1 } },
    });
    if (updated.count === 0) return false;

    await tx.interviewMessage.createMany({
      data: [
        {
          id: answer.id,
          sessionId,
          role: "CANDIDATE",
          content: answer.content,
          createdAt: answeredAt,
        },
        {
          id: reply.id,
          sessionId,
          role: "INTERVIEWER",
          content: reply.content,
          createdAt: repliedAt,
        },
      ],
    });
    return true;
  });
}

export async function completeInterview(userId: string, id: string) {
  const result = await prisma.interviewSession.updateMany({
    where: { id, userId, status: "IN_PROGRESS" },
    data: { status: "COMPLETED", completedAt: new Date() },
  });
  return result.count > 0;
}

export async function interviewMessageExists(id: string) {
  const message = await prisma.interviewMessage.findUnique({
    where: { id },
    select: { id: true },
  });
  return message !== null;
}
