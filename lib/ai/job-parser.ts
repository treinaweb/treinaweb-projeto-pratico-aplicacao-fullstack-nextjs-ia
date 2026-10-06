import { generateText, Output } from "ai";

import { jobParserModel } from "@/lib/ai/provider";
import {
  jobPostingSchema,
  type JobPostingData,
} from "@/lib/validation/job-posting";

const INSTRUCTIONS = `Você extrai dados estruturados de anúncios de vagas de emprego.

Regras:
- Use apenas informações explicitamente presentes no texto. Nunca invente, deduza ou complete valores.
- Quando uma informação não estiver no texto, use null (campos de texto) ou uma lista vazia (campos de lista).
- Mantenha o idioma original do anúncio; não traduza.
- workModel: REMOTE para remoto, HYBRID para híbrido, ONSITE para presencial; null se não for mencionado.
- salary: copie o salário ou a faixa salarial como aparece no texto (ex.: "R$ 8.000 - R$ 10.000", "a combinar").
- Listas: um item por responsabilidade, requisito, diferencial ou benefício, em frases curtas, sem marcadores.
- summary: até 3 frases resumindo a vaga com base no texto.`;

const PARSE_TIMEOUT_MS = 60_000;

export async function parseJobPosting(rawText: string): Promise<JobPostingData> {
  const { output } = await generateText({
    model: jobParserModel,
    output: Output.object({ schema: jobPostingSchema }),
    instructions: INSTRUCTIONS,
    prompt: rawText,
    timeout: PARSE_TIMEOUT_MS,
  });

  return output;
}
