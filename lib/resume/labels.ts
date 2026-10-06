import type { ResumeLanguage } from "@/lib/validation/resume";

// Fixed resume texts shared by the web view and the PDF template.
export const RESUME_LABELS = {
  "pt-BR": {
    summary: "Resumo profissional",
    experiences: "Experiência profissional",
    education: "Formação acadêmica",
    courses: "Cursos e certificações",
    projects: "Projetos",
    skills: "Habilidades",
    languages: "Idiomas",
    present: "atual",
    hours: (hours: number) => `${hours} h`,
  },
  en: {
    summary: "Professional summary",
    experiences: "Work experience",
    education: "Education",
    courses: "Courses and certifications",
    projects: "Projects",
    skills: "Skills",
    languages: "Languages",
    present: "Present",
    hours: (hours: number) => `${hours} h`,
  },
} as const;

export const PROFICIENCY_LABELS: Record<
  ResumeLanguage,
  Record<string, string>
> = {
  "pt-BR": {
    BASIC: "Básico",
    INTERMEDIATE: "Intermediário",
    ADVANCED: "Avançado",
    FLUENT: "Fluente",
    NATIVE: "Nativo",
  },
  en: {
    BASIC: "Basic",
    INTERMEDIATE: "Intermediate",
    ADVANCED: "Advanced",
    FLUENT: "Fluent",
    NATIVE: "Native",
  },
};

const PT_MONTHS = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
];
const EN_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// Dates are stored at UTC midnight, so UTC getters avoid off-by-one months.
export function formatMonth(iso: string, language: ResumeLanguage) {
  const date = new Date(iso);
  const month = date.getUTCMonth();
  const year = date.getUTCFullYear();
  return language === "pt-BR"
    ? `${PT_MONTHS[month]}/${year}`
    : `${EN_MONTHS[month]} ${year}`;
}

export function formatPeriod(
  startDate: string,
  endDate: string | null,
  language: ResumeLanguage,
) {
  const end = endDate
    ? formatMonth(endDate, language)
    : RESUME_LABELS[language].present;
  return `${formatMonth(startDate, language)} – ${end}`;
}
