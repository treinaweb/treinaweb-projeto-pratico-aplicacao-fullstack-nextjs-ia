import { generateText, Output } from "ai";

import { resumeWriterModel } from "@/lib/ai/provider";
import type { FullProfile } from "@/lib/db/repositories/candidate-profile";
import type { JobPosting } from "@/lib/generated/prisma/client";
import { resumeDraftSchema, type ResumeDraft } from "@/lib/validation/resume";

const INSTRUCTIONS = `Você escreve currículos adaptados a uma vaga específica, usando somente os dados do perfil do candidato.

Você recebe o PERFIL (cada item tem um "id") e a VAGA. Responda com referências aos itens do perfil e com textos reescritos.

Regras de veracidade (obrigatórias):
- Nunca invente empresas, cargos, datas, formações, cursos, projetos, tecnologias, conquistas, números ou responsabilidades.
- Use apenas ids que existem no perfil. Em "skills", use apenas nomes que existem nas habilidades do perfil.
- Se a vaga pede algo que o perfil não tem, não afirme que o candidato tem; simplesmente não mencione.
- Destaques de experiência e descrições de projetos devem reescrever o que está na descrição do item no perfil, com foco no que a vaga pede. Se o item não tiver descrição, use no máximo um destaque genérico baseado apenas no cargo, ou nenhum.

Adaptação à vaga:
- Selecione os itens relevantes para a vaga e ordene-os do mais para o menos relevante. Itens sem relação com a vaga podem ficar de fora.
- Inclua todas as formações acadêmicas e idiomas, salvo se claramente irrelevantes.
- headline: título profissional curto baseado no cargo mais recente ou no headline do perfil, com o foco da vaga. Não copie o título da vaga e não acrescente nível de senioridade (júnior, pleno, sênior, junior, mid-level, senior etc.) que não esteja no perfil.
- Não afirme anos de experiência diferentes dos que as datas do perfil sustentam.
- summary: 3 a 5 frases sobre o candidato, conectando a experiência real dele ao que a vaga pede.
- Até 5 destaques por experiência, frases curtas começando com verbo de ação.

Idioma:
- language = "pt-BR" se a vaga estiver em português; caso contrário, "en".
- Escreva todos os textos (headline, summary, destaques, descrições) nesse idioma.

Formato: texto simples, sem emoji, sem marcadores, sem markdown.`;

const WRITE_TIMEOUT_MS = 90_000;

const toDay = (date: Date | null) => date?.toISOString().slice(0, 10) ?? null;

// Only the fields the resume uses, keeping item ids so the answer can
// reference them.
function profileForPrompt(profile: FullProfile) {
  return {
    headline: profile.headline,
    summary: profile.summary,
    workExperiences: profile.workExperiences.map((item) => ({
      id: item.id,
      company: item.company,
      role: item.role,
      startDate: toDay(item.startDate),
      endDate: toDay(item.endDate),
      description: item.description,
    })),
    educations: profile.educations.map((item) => ({
      id: item.id,
      institution: item.institution,
      degree: item.degree,
      startDate: toDay(item.startDate),
      endDate: toDay(item.endDate),
    })),
    courses: profile.courses.map((item) => ({
      id: item.id,
      name: item.name,
      institution: item.institution,
    })),
    projects: profile.projects.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
    })),
    skills: profile.skills.map((item) => item.name),
    languages: profile.languages.map((item) => ({
      id: item.id,
      name: item.name,
      proficiency: item.proficiency,
    })),
  };
}

function postingForPrompt(posting: JobPosting) {
  return {
    title: posting.title,
    company: posting.company,
    seniority: posting.seniority,
    summary: posting.summary,
    responsibilities: posting.responsibilities,
    requirements: posting.requirements,
    niceToHave: posting.niceToHave,
  };
}

export async function writeResumeDraft(
  profile: FullProfile,
  posting: JobPosting,
): Promise<ResumeDraft> {
  const { output } = await generateText({
    model: resumeWriterModel,
    output: Output.object({ schema: resumeDraftSchema }),
    instructions: INSTRUCTIONS,
    prompt: [
      `PERFIL:\n${JSON.stringify(profileForPrompt(profile))}`,
      `VAGA:\n${JSON.stringify(postingForPrompt(posting))}`,
    ].join("\n\n"),
    timeout: WRITE_TIMEOUT_MS,
  });

  return output;
}
