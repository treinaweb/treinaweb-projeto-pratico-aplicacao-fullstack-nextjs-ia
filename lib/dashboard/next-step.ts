import { criterionAverages } from "@/lib/dashboard/metrics";
import { missingCoreSections } from "@/lib/dashboard/profile";
import type { DashboardSummary, PostingRef } from "@/lib/dashboard/types";

export type NextStep = {
  kind:
    | "continue-interview"
    | "generate-analysis"
    | "complete-profile"
    | "add-first-job"
    | "generate-resume"
    | "practice-interview"
    | "practice-weakest"
    | "add-job";
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
};

function postingName({ title, company }: PostingRef) {
  return company ? `${title} · ${company}` : title;
}

function list(items: string[]) {
  return items.length > 1
    ? `${items.slice(0, -1).join(", ")} e ${items[items.length - 1]}`
    : items[0];
}

// The first rule that applies wins; the order is part of the dashboard spec.
// Lists in the summary are newest first, so find() returns the most recent.
export function computeNextStep(summary: DashboardSummary): NextStep {
  const inProgress = summary.interviews.find((i) => i.status === "IN_PROGRESS");
  if (inProgress) {
    return {
      kind: "continue-interview",
      title: "Continue sua entrevista",
      description: `Você tem uma entrevista simulada em andamento para ${postingName(inProgress.posting)}.`,
      href: `/interviews/${inProgress.id}`,
      ctaLabel: "Continuar entrevista",
    };
  }

  const toAnalyze = summary.interviews.find(
    (i) => i.status === "COMPLETED" && i.hasAnswers && !i.analysis,
  );
  if (toAnalyze) {
    return {
      kind: "generate-analysis",
      title: "Veja como você se saiu",
      description: `Sua entrevista para ${postingName(toAnalyze.posting)} terminou. Gere a análise para receber nota e feedback.`,
      href: `/interviews/${toAnalyze.id}`,
      ctaLabel: "Gerar análise",
    };
  }

  const missingCore = missingCoreSections(summary);
  if (missingCore.length > 0) {
    return {
      kind: "complete-profile",
      title: "Complete seu perfil",
      description: `Seu currículo depende do seu perfil. Falta preencher: ${list(missingCore)}.`,
      href: "/profile",
      ctaLabel: "Completar perfil",
    };
  }

  if (summary.jobPostings.length === 0) {
    return {
      kind: "add-first-job",
      title: "Adicione sua primeira vaga",
      description: "Cole o anúncio de uma vaga que te interessa e a IA organiza os dados para você.",
      href: "/jobs/new",
      ctaLabel: "Adicionar vaga",
    };
  }

  const jobWithoutResume = summary.jobPostings.find((job) => job.resumeCount === 0);
  if (jobWithoutResume) {
    return {
      kind: "generate-resume",
      title: "Gere um currículo sob medida",
      description: `A vaga ${postingName(jobWithoutResume)} ainda não tem currículo.`,
      href: `/resumes/new?jobPostingId=${jobWithoutResume.id}`,
      ctaLabel: "Gerar currículo",
    };
  }

  const resumeWithoutInterview = summary.resumes.find((r) => r.interviewCount === 0);
  if (resumeWithoutInterview) {
    return {
      kind: "practice-interview",
      title: "Treine para a entrevista",
      description: `Simule uma entrevista com o currículo para ${postingName(resumeWithoutInterview.posting)}.`,
      href: `/interviews/new?resumeId=${resumeWithoutInterview.id}`,
      ctaLabel: "Simular entrevista",
    };
  }

  if (summary.interviews.some((i) => i.analysis)) {
    const weakest = criterionAverages(summary)?.weakest;
    return {
      kind: "practice-weakest",
      title: "Treine de novo",
      description: weakest
        ? `Seu ponto mais fraco é ${weakest.label.toLowerCase()} (${weakest.value}). Faça mais uma entrevista com foco nele.`
        : "Faça mais uma entrevista simulada para continuar evoluindo.",
      href: "/interviews/new",
      ctaLabel: "Nova entrevista",
    };
  }

  return {
    kind: "add-job",
    title: "Adicione uma nova vaga",
    description: "Salve outra vaga para gerar um novo currículo e continuar treinando.",
    href: "/jobs/new",
    ctaLabel: "Adicionar vaga",
  };
}
