import { createOpenAI } from "@ai-sdk/openai";

// The only module that knows which AI provider/models are used. Features import
// the model handles below instead of `@ai-sdk/openai`.
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const jobParserModel = openai(
  process.env.OPENAI_JOB_PARSER_MODEL ?? "gpt-5.4-mini",
);
