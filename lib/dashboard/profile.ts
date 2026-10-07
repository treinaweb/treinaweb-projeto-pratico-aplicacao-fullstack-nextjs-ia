import type { DashboardSummary } from "@/lib/dashboard/types";

type Profile = DashboardSummary["profile"];

// The eight equally weighted sections of profile completeness.
const SECTIONS: { label: string; filled: (profile: Profile) => boolean }[] = [
  { label: "Dados pessoais", filled: (p) => p.hasHeadline && p.hasSummary },
  { label: "Experiências", filled: (p) => p.counts.workExperiences > 0 },
  { label: "Formação", filled: (p) => p.counts.educations > 0 },
  { label: "Cursos", filled: (p) => p.counts.courses > 0 },
  { label: "Projetos", filled: (p) => p.counts.projects > 0 },
  { label: "Links", filled: (p) => p.counts.links > 0 },
  { label: "Habilidades", filled: (p) => p.counts.skills > 0 },
  { label: "Idiomas", filled: (p) => p.counts.languages > 0 },
];

export function computeProfileCompleteness(summary: DashboardSummary) {
  const missing = SECTIONS.filter((section) => !section.filled(summary.profile)).map(
    (section) => section.label,
  );
  const filledCount = SECTIONS.length - missing.length;
  return {
    percent: Math.round((filledCount / SECTIONS.length) * 100),
    missing,
  };
}

// What a resume needs at minimum: who you are, what you know, and either
// work experience or education (so a recent graduate isn't blocked).
export function missingCoreSections(summary: DashboardSummary): string[] {
  const { profile } = summary;
  const missing: string[] = [];
  if (!profile.hasHeadline || !profile.hasSummary) {
    missing.push("headline e resumo");
  }
  if (profile.counts.skills === 0) {
    missing.push("habilidades");
  }
  if (profile.counts.workExperiences === 0 && profile.counts.educations === 0) {
    missing.push("experiência ou formação");
  }
  return missing;
}
