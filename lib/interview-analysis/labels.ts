import type { CriterionKey } from "@/lib/validation/interview-analysis";

type Language = "pt-BR" | "en";

// Analysis texts shown on the interview page, in the interview's language.
export const ANALYSIS_LABELS = {
  "pt-BR": {
    title: "Análise da entrevista",
    overall: "Nota geral",
    criteria: "Critérios",
    strengths: "Pontos fortes",
    weaknesses: "Pontos fracos",
    suggestions: "Sugestões de melhoria",
    answers: "Feedback por resposta",
    question: "Pergunta",
    answer: "Sua resposta",
    comment: "Comentário",
    suggestion: "Como melhorar",
  },
  en: {
    title: "Interview analysis",
    overall: "Overall score",
    criteria: "Criteria",
    strengths: "Strengths",
    weaknesses: "Weaknesses",
    suggestions: "Improvement suggestions",
    answers: "Feedback per answer",
    question: "Question",
    answer: "Your answer",
    comment: "Comment",
    suggestion: "How to improve",
  },
} as const;

export const CRITERION_LABELS: Record<Language, Record<CriterionKey, string>> =
  {
    "pt-BR": {
      communication: "Comunicação",
      technicalKnowledge: "Conhecimento técnico",
      roleFit: "Aderência à vaga",
      concreteExamples: "Exemplos concretos",
    },
    en: {
      communication: "Communication",
      technicalKnowledge: "Technical knowledge",
      roleFit: "Fit with the role",
      concreteExamples: "Concrete examples",
    },
  };

export function analysisLanguage(language: string): Language {
  return language === "en" ? "en" : "pt-BR";
}
