import {
  convertToModelMessages,
  createIdGenerator,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";

import { getSession } from "@/lib/auth/session";
import {
  buildInterviewContext,
  buildInterviewerInstructions,
} from "@/lib/ai/interviewer";
import { interviewerModel } from "@/lib/ai/provider";
import {
  appendExchange,
  getInterview,
  interviewMessageExists,
} from "@/lib/db/repositories/interviews";
import {
  chatRequestSchema,
  INTERVIEW_QUESTION_LIMIT,
} from "@/lib/validation/interview";
import { resumeContentSchema } from "@/lib/validation/resume";

export const maxDuration = 60;

const generateMessageId = createIdGenerator({ prefix: "msg", size: 16 });

function jsonError(status: number, error: string) {
  return Response.json({ error }, { status });
}

function textOf(message: UIMessage) {
  return message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("")
    .trim();
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return jsonError(401, "Não autenticado.");
  }
  const userId = session.user.id;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "Requisição inválida.");
  }
  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(400, parsed.error.issues[0]?.message ?? "Requisição inválida.");
  }
  const { id, messageId, text } = parsed.data;

  const interview = await getInterview(userId, id);
  if (!interview) {
    return jsonError(404, "Entrevista não encontrada.");
  }
  if (interview.status === "COMPLETED") {
    return jsonError(409, "Esta entrevista já foi concluída.");
  }
  if (await interviewMessageExists(messageId)) {
    return jsonError(409, "Esta resposta já foi enviada.");
  }

  const closing = interview.questionCount >= INTERVIEW_QUESTION_LIMIT;
  const context = buildInterviewContext(
    resumeContentSchema.parse(interview.resume.content),
    interview.resume.jobPosting,
  );
  const answer: UIMessage = {
    id: messageId,
    role: "user",
    parts: [{ type: "text", text }],
  };
  const history = [...interview.messages, answer];

  const result = streamText({
    model: interviewerModel,
    instructions: buildInterviewerInstructions(
      context,
      closing
        ? { kind: "closing" }
        : { kind: "question", number: interview.questionCount + 1 },
    ),
    messages: await convertToModelMessages(history),
  });

  // Let the reply finish (and be saved) even if the browser disconnects.
  void result.consumeStream();

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      originalMessages: history,
      generateMessageId,
      onError: (error) => {
        console.error("Interview reply failed", error);
        return "Não foi possível obter a resposta do entrevistador.";
      },
      onEnd: async ({ outcome, isAborted, finishReason, responseMessage }) => {
        // Only a reply that finished normally is saved; errors mid-stream do
        // not change `outcome`, so `finishReason` must be checked too.
        const reply = textOf(responseMessage);
        if (
          outcome.status !== "completed" ||
          isAborted ||
          finishReason !== "stop" ||
          !reply
        ) {
          return;
        }
        try {
          const saved = await appendExchange(
            userId,
            interview.id,
            {
              answer: { id: messageId, content: text },
              reply: { id: responseMessage.id, content: reply },
            },
            { complete: closing },
          );
          if (!saved) {
            console.warn("Interview exchange not saved", interview.id);
          }
        } catch (error) {
          console.error("Interview exchange save failed", error);
        }
      },
    }),
  });
}
