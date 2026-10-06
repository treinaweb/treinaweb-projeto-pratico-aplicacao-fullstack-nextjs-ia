import { z } from "zod";

// Core job posting shape. Also used as the AI structured-output schema, so it
// must stay compatible with OpenAI strict mode: optional values use
// `.nullable()` (never `.optional()`/`.nullish()`) and no preprocess/transforms.
export const jobWorkModelSchema = z.enum(["REMOTE", "HYBRID", "ONSITE"]);

export const jobPostingSchema = z.object({
  title: z.string().describe("Título do cargo/vaga."),
  company: z.string().nullable().describe("Nome da empresa contratante."),
  location: z.string().nullable().describe("Cidade/estado/país da vaga."),
  workModel: jobWorkModelSchema
    .nullable()
    .describe("Modelo de trabalho: remoto, híbrido ou presencial."),
  employmentType: z
    .string()
    .nullable()
    .describe("Tipo de contratação, ex.: CLT, PJ, estágio, temporário."),
  seniority: z
    .string()
    .nullable()
    .describe("Senioridade, ex.: júnior, pleno, sênior, especialista."),
  salary: z
    .string()
    .nullable()
    .describe("Salário ou faixa salarial exatamente como informado."),
  summary: z
    .string()
    .nullable()
    .describe("Resumo curto da vaga e da empresa."),
  responsibilities: z.array(z.string()).describe("Responsabilidades/atividades."),
  requirements: z.array(z.string()).describe("Requisitos obrigatórios."),
  niceToHave: z.array(z.string()).describe("Requisitos desejáveis/diferenciais."),
  benefits: z.array(z.string()).describe("Benefícios oferecidos."),
});

export type JobPostingData = z.infer<typeof jobPostingSchema>;

export const RAW_TEXT_MIN = 50;
export const RAW_TEXT_MAX = 20_000;

const rawTextSchema = z
  .string("Cole o texto da vaga.")
  .trim()
  .min(RAW_TEXT_MIN, `O texto da vaga deve ter pelo menos ${RAW_TEXT_MIN} caracteres.`)
  .max(RAW_TEXT_MAX, `O texto da vaga deve ter no máximo ${RAW_TEXT_MAX} caracteres.`);

export const rawJobPostingSchema = z.object({
  rawText: rawTextSchema,
});

export const jobPostingFormSchema = jobPostingSchema.extend({
  title: z.string().trim().min(1, "Informe o título da vaga."),
  rawText: rawTextSchema,
});

export type JobPostingFormInput = z.infer<typeof jobPostingFormSchema>;

const LIST_FIELDS = [
  "responsibilities",
  "requirements",
  "niceToHave",
  "benefits",
] as const;

const TEXT_FIELDS = [
  "title",
  "company",
  "location",
  "workModel",
  "employmentType",
  "seniority",
  "salary",
  "summary",
] as const;

function textOrNull(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function lines(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return [];
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");
}

// Converts the review form's FormData into the shape `jobPostingFormSchema`
// expects: empty strings become null, one-item-per-line textareas become arrays.
export function jobPostingInputFromFormData(formData: FormData) {
  const input: Record<string, unknown> = {
    rawText: formData.get("rawText"),
  };
  for (const field of TEXT_FIELDS) {
    input[field] = textOrNull(formData.get(field));
  }
  for (const field of LIST_FIELDS) {
    input[field] = lines(formData.get(field));
  }
  // Title must reach the schema as a string so the "required" message is shown.
  input.title ??= "";
  return input;
}
