import { CRITERION_LABELS } from "@/lib/interview-analysis/labels";
import { missingCoreSections } from "@/lib/dashboard/profile";
import type { CriterionKey } from "@/lib/validation/interview-analysis";
import type { Criteria, DashboardSummary } from "@/lib/dashboard/types";

// Fixed order: ties for the weakest criterion go to the first one.
export const CRITERION_ORDER: CriterionKey[] = [
  "communication",
  "technicalKnowledge",
  "roleFit",
  "concreteExamples",
];

function analyses(summary: DashboardSummary) {
  return summary.interviews.flatMap((interview) =>
    interview.analysis ? [{ ...interview.analysis, interview }] : [],
  );
}

export function computeMetrics(summary: DashboardSummary) {
  const scores = analyses(summary).map((analysis) => analysis.overallScore);
  return {
    jobPostings: summary.jobPostings.length,
    resumes: summary.resumes.length,
    interviewsInProgress: summary.interviews.filter((i) => i.status === "IN_PROGRESS")
      .length,
    interviewsCompleted: summary.interviews.filter((i) => i.status === "COMPLETED")
      .length,
    averageScore: scores.length
      ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
      : null,
    analysisCount: scores.length,
  };
}

export type ScoreTrendPoint = {
  date: string; // ISO, serializable for the client chart
  score: number;
  title: string;
  company: string | null;
};

// Oldest analysis first.
export function scoreTrend(summary: DashboardSummary): ScoreTrendPoint[] {
  return analyses(summary)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    .map((analysis) => ({
      date: analysis.createdAt.toISOString(),
      score: analysis.overallScore,
      title: analysis.interview.posting.title,
      company: analysis.interview.posting.company,
    }));
}

export type CriterionAverage = { key: CriterionKey; label: string; value: number };

export function criterionAverages(summary: DashboardSummary) {
  const criteria = analyses(summary)
    .map((analysis) => analysis.criteria)
    .filter((value): value is Criteria => value !== null);
  if (criteria.length === 0) return null;

  const averages: CriterionAverage[] = CRITERION_ORDER.map((key) => ({
    key,
    label: CRITERION_LABELS["pt-BR"][key],
    value: Math.round(
      criteria.reduce((sum, item) => sum + item[key], 0) / criteria.length,
    ),
  }));
  const weakest = averages.reduce((low, item) => (item.value < low.value ? item : low));
  return { averages, weakest };
}

export type ActivityEvent = {
  kind:
    | "job-saved"
    | "resume-generated"
    | "interview-started"
    | "interview-completed"
    | "analysis-generated";
  date: Date;
  title: string;
  company: string | null;
  href: string;
};

export function recentActivity(summary: DashboardSummary, limit = 5): ActivityEvent[] {
  const events: ActivityEvent[] = [
    ...summary.jobPostings.map((job) => ({
      kind: "job-saved" as const,
      date: job.createdAt,
      title: job.title,
      company: job.company,
      href: "/jobs",
    })),
    ...summary.resumes.map((resume) => ({
      kind: "resume-generated" as const,
      date: resume.createdAt,
      ...resume.posting,
      href: `/resumes/${resume.id}`,
    })),
    ...summary.interviews.flatMap((interview) => {
      const href = `/interviews/${interview.id}`;
      const base = { ...interview.posting, href };
      return [
        { kind: "interview-started" as const, date: interview.createdAt, ...base },
        ...(interview.completedAt
          ? [{ kind: "interview-completed" as const, date: interview.completedAt, ...base }]
          : []),
        ...(interview.analysis
          ? [
              {
                kind: "analysis-generated" as const,
                date: interview.analysis.createdAt,
                ...base,
              },
            ]
          : []),
      ];
    }),
  ];
  return events.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, limit);
}

export type OnboardingStep = { label: string; done: boolean };

export function onboardingSteps(summary: DashboardSummary): OnboardingStep[] {
  return [
    { label: "Criar sua conta", done: true },
    { label: "Completar o essencial do perfil", done: missingCoreSections(summary).length === 0 },
    { label: "Adicionar uma vaga", done: summary.jobPostings.length > 0 },
    { label: "Gerar um currículo", done: summary.resumes.length > 0 },
    {
      label: "Concluir uma entrevista simulada",
      done: summary.interviews.some((interview) => interview.status === "COMPLETED"),
    },
    {
      label: "Receber a análise da entrevista",
      done: summary.interviews.some((interview) => interview.analysis !== null),
    },
  ];
}
