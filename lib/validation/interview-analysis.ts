import { z } from "zod";

const criterionScore = z.number().int().min(0).max(100);

// What the AI returns. Feedback items reference candidate answers by message
// id; `assembleInterviewAnalysis` maps them to the real transcript. Must stay
// compatible with OpenAI strict mode (no optional/transforms).
export const interviewAnalysisDraftSchema = z.object({
  criteria: z.object({
    communication: z
      .number()
      .int()
      .describe("Comunicação: clareza, estrutura e objetividade (0-100)."),
    technicalKnowledge: z
      .number()
      .int()
      .describe("Conhecimento técnico frente aos requisitos da vaga (0-100)."),
    roleFit: z
      .number()
      .int()
      .describe("Aderência às responsabilidades e senioridade da vaga (0-100)."),
    concreteExamples: z
      .number()
      .int()
      .describe("Uso de exemplos concretos: situação, ação e resultado (0-100)."),
  }),
  strengths: z.array(z.string()).describe("Pontos fortes."),
  weaknesses: z.array(z.string()).describe("Pontos fracos."),
  suggestions: z.array(z.string()).describe("Sugestões de melhoria."),
  answers: z
    .array(
      z.object({
        answerId: z.string().describe("id da resposta do candidato."),
        comment: z.string().describe("Comentário curto sobre a resposta."),
        suggestion: z
          .string()
          .describe("Como responder melhor a essa pergunta."),
      }),
    )
    .describe("Um item para cada resposta do candidato."),
});

export type InterviewAnalysisDraft = z.infer<
  typeof interviewAnalysisDraftSchema
>;

// The assembled analysis stored in `InterviewAnalysis.content`.
export const interviewAnalysisContentSchema = z.object({
  overallScore: criterionScore,
  criteria: z.object({
    communication: criterionScore,
    technicalKnowledge: criterionScore,
    roleFit: criterionScore,
    concreteExamples: criterionScore,
  }),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  suggestions: z.array(z.string()),
  answers: z.array(
    z.object({
      answerId: z.string(),
      comment: z.string(),
      suggestion: z.string(),
    }),
  ),
});

export type InterviewAnalysisContent = z.infer<
  typeof interviewAnalysisContentSchema
>;

export type CriterionKey = keyof InterviewAnalysisContent["criteria"];
