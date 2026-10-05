import { z } from "zod";

const emptyToNull = (val: unknown) =>
  typeof val === "string" && val.trim() === "" ? null : val;

const optionalText = z.preprocess(emptyToNull, z.string().trim().nullable());
const requiredDate = z.coerce.date("Informe uma data válida.");
const optionalDate = z.preprocess(
  emptyToNull,
  z.coerce.date("Informe uma data válida.").nullable(),
);

export const personalInfoSchema = z.object({
  headline: optionalText,
  phone: optionalText,
  location: optionalText,
  summary: optionalText,
});

export type PersonalInfoInput = z.infer<typeof personalInfoSchema>;

export const workExperienceSchema = z.object({
  company: z.string().trim().min(1, "Informe a empresa."),
  role: z.string().trim().min(1, "Informe o cargo."),
  startDate: requiredDate,
  endDate: optionalDate,
  description: optionalText,
});

export type WorkExperienceFormInput = z.infer<typeof workExperienceSchema>;

export const educationSchema = z.object({
  institution: z.string().trim().min(1, "Informe a instituição."),
  degree: z.string().trim().min(1, "Informe o curso/grau."),
  startDate: requiredDate,
  endDate: optionalDate,
});

export type EducationFormInput = z.infer<typeof educationSchema>;

export const courseSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do curso."),
  institution: optionalText,
  completedAt: optionalDate,
  workloadHours: z.preprocess(
    emptyToNull,
    z.coerce
      .number("Informe um número de horas válido.")
      .int()
      .positive()
      .nullable(),
  ),
});

export type CourseFormInput = z.infer<typeof courseSchema>;

export const projectSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do projeto."),
  description: optionalText,
  link: z.preprocess(
    emptyToNull,
    z.url("Informe uma URL válida.").nullable(),
  ),
});

export type ProjectFormInput = z.infer<typeof projectSchema>;

export const profileLinkSchema = z.object({
  label: z.string().trim().min(1, "Informe um rótulo para o link."),
  url: z.url("Informe uma URL válida."),
});

export type ProfileLinkFormInput = z.infer<typeof profileLinkSchema>;

export const skillSchema = z.object({
  name: z.string().trim().min(1, "Informe a habilidade."),
});

export type SkillFormInput = z.infer<typeof skillSchema>;

export const languageProficiencySchema = z.enum([
  "BASIC",
  "INTERMEDIATE",
  "ADVANCED",
  "FLUENT",
  "NATIVE",
]);

export const languageSchema = z.object({
  name: z.string().trim().min(1, "Informe o idioma."),
  proficiency: languageProficiencySchema,
});

export type LanguageFormInput = z.infer<typeof languageSchema>;
