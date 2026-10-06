# Design

## Context

`define-platform-architecture/design.md` already decided the AI stack (Vercel AI SDK, OpenAI isolated in `lib/ai/provider.ts` with per-feature model handles), Prisma behind `lib/db/repositories`, one Zod schema per entity, and `app/` only orchestrating. `add-candidate-profile` established the concrete patterns this change follows: application models reference `User` only through a plain `userId` string (no Prisma relation, so a Better-Auth schema regeneration can't break them), ownership is enforced inside repository queries, and forms are `"use client"` components using `useActionState` against Server Actions that validate server-side with Zod.

There is no AI code in the repo yet; `ai` and `@ai-sdk/openai` are not in `package.json`. The current AI SDK major is **v7** (`ai@7`, `@ai-sdk/openai@4`), where `generateObject` is deprecated in favor of `generateText({ output: Output.object({ schema }) })`, `system` is renamed to `instructions`, and failures to produce a valid object throw `NoObjectGeneratedError`. The architecture design's mention of `generateObject` predates this; the intent (structured output validated by a Zod schema) is unchanged.

See `proposal.md` for motivation and `specs/job-postings/spec.md` for the requirements.

## Goals / Non-Goals

**Goals:**
- Introduce the AI provider module in the shape every later AI feature will reuse.
- A two-step create flow (paste → review → save) where extraction never persists anything.
- One Zod definition of a job posting that serves AI output, review-form validation, and repository input.

**Non-Goals:**
- Streaming partial extraction results into the form (a single awaited call with a loading state is enough at this payload size).
- Automated tests for the AI call — the repo has no test runner yet; verification is manual plus `lint`/`build`.
- Rate limiting or per-user AI cost quotas.

## Decisions

**1. `lib/ai/provider.ts` owns the OpenAI dependency; `lib/ai/job-parser.ts` owns the prompt.**
`provider.ts` creates the provider with `createOpenAI` and exports `jobParserModel`. The model id is read from `OPENAI_JOB_PARSER_MODEL` with a small, cheap default from OpenAI's current lineup chosen at implementation time. `job-parser.ts` exports `parseJobPosting(rawText): Promise<JobPostingData>` that calls `generateText` with `Output.object({ schema: jobPostingSchema })`, fixed `instructions` (extract only what is stated, leave unknown fields `null`/empty, keep the posting's original language, never invent), and the raw text as the prompt.
*Why*: matches architecture decision 1 — swapping provider or model is a one-file/env change; feature code never imports `@ai-sdk/openai`.
*Alternatives considered*: deprecated `generateObject` (rejected — deprecated in v6+); passing a gateway model string like `'openai/…'` (rejected — adds a Vercel AI Gateway dependency and its own key).

**2. One "core" Zod schema, compatible with OpenAI strict structured outputs.**
`lib/validation/job-posting.ts` exports `jobPostingSchema`, a plain `z.object` where every optional scalar is `.nullable()` (never `.optional()`/`.nullish()`, which OpenAI strict mode rejects), list fields are `z.array(z.string())`, `workModel` is `z.enum(["REMOTE","HYBRID","ONSITE"]).nullable()`, and `title` is a required string. No `z.preprocess`/transforms in this schema, since those don't translate to JSON Schema for the model. Fields: `title`, `company`, `location`, `workModel`, `employmentType`, `seniority`, `salary`, `summary`, `responsibilities`, `requirements`, `niceToHave`, `benefits`. `employmentType`, `seniority`, and `salary` stay free text because Brazilian postings mix CLT/PJ/estágio, ranges, and "a combinar" in ways an enum would lose.
The save path reuses it: `jobPostingFormSchema = jobPostingSchema.extend({ title: <non-empty trimmed>, rawText: <50..20,000 chars> })` plus an input normalizer in the action that turns empty strings into `null` and one-item-per-line textareas into trimmed, non-empty string arrays. A separate `rawJobPostingSchema` validates the paste step's 50–20,000 character limit.
*Why*: keeps architecture decision 4 (no drift between AI output, form, and storage) while respecting the provider's schema constraints.
*Alternatives considered*: reusing the profile's `z.preprocess` helpers inside the AI schema (rejected — breaks JSON Schema generation for strict mode).

**3. `JobPosting` Prisma model scoped by plain `userId`.**
New model `JobPosting { id, userId, title, company?, location?, workModel? (enum JobWorkModel), employmentType?, seniority?, salary?, summary?, responsibilities String[], requirements String[], niceToHave String[], benefits String[], rawText (Text), createdAt, updatedAt }` with `@@index([userId, createdAt])`, mapped to `job_posting`. Like `CandidateProfile`, `userId` is a plain string with no `@relation` to `User`. Postings hang off the user, not the candidate profile, because a posting doesn't depend on profile data and shouldn't force profile creation.
`lib/db/repositories/job-postings.ts` exposes `createJobPosting(userId, data)` and `listJobPostings(userId)` (ordered `createdAt desc`, selecting only the columns the list needs). Every query filters by `userId`.
*Why*: same isolation and ownership guarantees as `add-candidate-profile` decisions 1 and 3. Postgres native arrays keep the list fields simple without child tables, since items are never queried individually.
*Alternatives considered*: child tables per list (rejected — no per-item behavior requires them); a single JSON column (rejected — loses typed columns the resume/interview features will read).

**4. Two Server Actions, one client component holding the step state.**
`app/jobs/actions.ts`:
- `parseJobPostingAction(prevState, formData)` — `requireSession()`, validates `rawText`, calls `parseJobPosting`, returns `{ rawText, extracted }` or `{ rawText, error }`. It never writes to the database. `NoObjectGeneratedError` and any provider error map to one generic Portuguese message ("Não foi possível analisar a vaga. Tente novamente.") and are logged server-side.
- `createJobPostingAction(prevState, formData)` — `requireSession()`, normalizes and validates with `jobPostingFormSchema`, calls `createJobPosting`, then `revalidatePath("/jobs")` and `redirect("/jobs")`. Returns field errors on validation failure.

`app/jobs/new/page.tsx` (server, gated by `requireSession()`) renders `components/jobs/new-job-posting-flow.tsx`, a client component with two steps: a paste form bound to the parse action, and — once `extracted` is present — a review form bound to the create action, pre-filled from the extraction, carrying `rawText` in a hidden field, with a "Voltar" button that returns to the paste step with the text intact. List fields render as textareas, one item per line.
*Why*: keeps extraction and persistence separate (spec: review before saving) without storing drafts server-side; the raw text round-trips through the client, which already has it.
*Alternatives considered*: saving a draft row on parse and updating on confirm (rejected — creates rows the candidate never confirmed, violating the spec); a Route Handler for parsing (rejected — a Server Action is the established pattern here and nothing needs streaming).

**5. `/jobs` list page and dashboard link.**
`app/jobs/page.tsx` (server, `requireSession()`) shows the candidate's postings (title, company, saved date formatted `pt-BR`), an empty state, and a "Nova vaga" link to `/jobs/new`. The dashboard gets a "Minhas vagas" link next to "Meu perfil". List items are not links yet (detail view is out of scope).

**6. UI copy in Portuguese, enum values in English.**
Matches the existing app: labels/messages in pt-BR, stored enum values (`REMOTE`/`HYBRID`/`ONSITE`) in English with a pt-BR label map in the component, like `LanguageProficiency`.

## Risks / Trade-offs

- [Risk] The model hallucinates fields (e.g. a salary) not in the text → Mitigation: explicit "never invent, use null" instructions, nullable fields so "unknown" is always expressible, and the mandatory review step.
- [Risk] Extraction latency (several seconds) with no feedback → Mitigation: `pending` from `useActionState` disables the button and shows "Analisando vaga…".
- [Risk] Missing or invalid `OPENAI_API_KEY` → Mitigation: surfaces as the generic extraction error in the UI plus a server log; `.env.example` documents the variable.
- [Risk] Each parse costs money and is unauthenticated-abuse-proof only via the session gate → accepted for the MVP; the 20,000-char cap bounds the per-call cost.
- [Trade-off] Raw text round-trips through the client between steps, so the candidate could alter the hidden field before saving → accepted; it's the candidate's own data and is validated by the same length rules.

## Migration Plan

Additive: one new enum, one new table, one migration; new env var. Build order: dependencies + env, Prisma model + migration, validation schema, AI provider + parser, repository, Server Actions, `/jobs/new` flow, `/jobs` list, dashboard link. Rollback is dropping the migration and the new routes; no existing table is touched.
