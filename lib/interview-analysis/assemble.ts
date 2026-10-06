import {
  interviewAnalysisContentSchema,
  type InterviewAnalysisContent,
  type InterviewAnalysisDraft,
} from "@/lib/validation/interview-analysis";

const MAX_LIST_ITEMS = 6;

const clamp = (score: number) =>
  Math.min(100, Math.max(0, Math.round(score)));

function cleanList(items: string[]) {
  return items
    .map((item) => item.trim())
    .filter((item) => item !== "")
    .slice(0, MAX_LIST_ITEMS);
}

export class MissingAnswerFeedbackError extends Error {
  constructor(missing: string[]) {
    super(`Analysis has no feedback for answers: ${missing.join(", ")}`);
    this.name = "MissingAnswerFeedbackError";
  }
}

// Builds the stored analysis from the AI draft. `answerIds` are the
// candidate's answers in transcript order; every one must get feedback.
export function assembleInterviewAnalysis({
  draft,
  answerIds,
}: {
  draft: InterviewAnalysisDraft;
  answerIds: string[];
}): InterviewAnalysisContent {
  const criteria = {
    communication: clamp(draft.criteria.communication),
    technicalKnowledge: clamp(draft.criteria.technicalKnowledge),
    roleFit: clamp(draft.criteria.roleFit),
    concreteExamples: clamp(draft.criteria.concreteExamples),
  };
  const scores = Object.values(criteria);
  const overallScore = Math.round(
    scores.reduce((sum, score) => sum + score, 0) / scores.length,
  );

  // First feedback item per known answer id wins; unknown ids are ignored.
  const byAnswer = new Map<string, { comment: string; suggestion: string }>();
  for (const item of draft.answers) {
    if (!answerIds.includes(item.answerId) || byAnswer.has(item.answerId)) {
      continue;
    }
    const comment = item.comment.trim();
    const suggestion = item.suggestion.trim();
    if (comment && suggestion) {
      byAnswer.set(item.answerId, { comment, suggestion });
    }
  }

  const missing = answerIds.filter((id) => !byAnswer.has(id));
  if (missing.length > 0) {
    throw new MissingAnswerFeedbackError(missing);
  }

  return interviewAnalysisContentSchema.parse({
    overallScore,
    criteria,
    strengths: cleanList(draft.strengths),
    weaknesses: cleanList(draft.weaknesses),
    suggestions: cleanList(draft.suggestions),
    answers: answerIds.map((answerId) => ({
      answerId,
      ...byAnswer.get(answerId)!,
    })),
  });
}
