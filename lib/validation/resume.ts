import { z } from "zod";

import { languageProficiencySchema } from "@/lib/validation/profile";

export const resumeLanguageSchema = z.enum(["pt-BR", "en"]);

export type ResumeLanguage = z.infer<typeof resumeLanguageSchema>;

// What the AI returns: references to profile items (by id) plus wording.
// Factual data is copied from the profile by `assembleResume`, never taken from
// here. Must stay compatible with OpenAI strict mode (no optional/transforms).
export const resumeDraftSchema = z.object({
  language: resumeLanguageSchema.describe(
    "pt-BR se a vaga estiver em português; caso contrário, en.",
  ),
  headline: z.string().describe("Título profissional curto alinhado à vaga."),
  summary: z.string().describe("Resumo profissional de 3 a 5 frases."),
  experiences: z
    .array(
      z.object({
        id: z.string().describe("id de uma experiência do perfil."),
        highlights: z
          .array(z.string())
          .describe("Destaques reescritos a partir da descrição do perfil."),
      }),
    )
    .describe("Experiências relevantes, na ordem em que devem aparecer."),
  educationIds: z.array(z.string()).describe("ids de formações do perfil."),
  courseIds: z.array(z.string()).describe("ids de cursos do perfil."),
  projects: z
    .array(
      z.object({
        id: z.string().describe("id de um projeto do perfil."),
        description: z
          .string()
          .describe("Descrição reescrita a partir da descrição do perfil."),
      }),
    )
    .describe("Projetos relevantes, na ordem em que devem aparecer."),
  skills: z
    .array(z.string())
    .describe("Nomes de habilidades do perfil, na ordem de relevância."),
  languageIds: z.array(z.string()).describe("ids de idiomas do perfil."),
});

export type ResumeDraft = z.infer<typeof resumeDraftSchema>;

// The assembled snapshot stored in `Resume.content`. Dates are ISO strings.
export const resumeContentSchema = z.object({
  language: resumeLanguageSchema,
  contact: z.object({
    name: z.string(),
    email: z.string(),
    phone: z.string().nullable(),
    location: z.string().nullable(),
    links: z.array(z.object({ label: z.string(), url: z.string() })),
  }),
  headline: z.string(),
  summary: z.string(),
  experiences: z.array(
    z.object({
      company: z.string(),
      role: z.string(),
      startDate: z.iso.datetime(),
      endDate: z.iso.datetime().nullable(),
      highlights: z.array(z.string()),
    }),
  ),
  education: z.array(
    z.object({
      institution: z.string(),
      degree: z.string(),
      startDate: z.iso.datetime(),
      endDate: z.iso.datetime().nullable(),
    }),
  ),
  courses: z.array(
    z.object({
      name: z.string(),
      institution: z.string().nullable(),
      completedAt: z.iso.datetime().nullable(),
      workloadHours: z.number().int().nullable(),
    }),
  ),
  projects: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      link: z.string().nullable(),
    }),
  ),
  skills: z.array(z.string()),
  languages: z.array(
    z.object({
      name: z.string(),
      proficiency: languageProficiencySchema,
    }),
  ),
});

export type ResumeContent = z.infer<typeof resumeContentSchema>;

export const generateResumeSchema = z.object({
  jobPostingId: z.string("Escolha uma vaga.").min(1, "Escolha uma vaga."),
});
