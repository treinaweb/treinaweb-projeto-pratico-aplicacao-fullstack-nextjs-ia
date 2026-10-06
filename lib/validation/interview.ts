import { z } from "zod";

export const INTERVIEW_QUESTION_LIMIT = 8;
export const ANSWER_MAX_LENGTH = 4000;

export const startInterviewSchema = z.object({
  resumeId: z
    .string("Escolha um currículo.")
    .min(1, "Escolha um currículo."),
});

// Body sent by the chat client: the interview id plus only the newest
// (candidate) message. The history is always loaded from the database.
export const chatRequestSchema = z
  .object({
    id: z.string().min(1),
    message: z.object({
      id: z.string().min(1),
      role: z.literal("user"),
      parts: z
        .array(z.looseObject({ type: z.literal("text"), text: z.string() }))
        .min(1),
    }),
  })
  .transform(({ id, message }) => ({
    id,
    messageId: message.id,
    text: message.parts.map((part) => part.text).join("").trim(),
  }))
  .refine((data) => data.text.length > 0, {
    message: "Escreva sua resposta antes de enviar.",
  })
  .refine((data) => data.text.length <= ANSWER_MAX_LENGTH, {
    message: `A resposta deve ter no máximo ${ANSWER_MAX_LENGTH} caracteres.`,
  });

export type ChatRequest = z.infer<typeof chatRequestSchema>;
