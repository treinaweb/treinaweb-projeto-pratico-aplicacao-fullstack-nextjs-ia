# Tasks

## 1. Dependencies and configuration

- [x] 1.1 Install `ai@^7` and `@ai-sdk/openai` as dependencies — verify both appear in `package.json` `dependencies` and `npm ls ai @ai-sdk/openai` shows no "extraneous"/missing entries
- [x] 1.2 Add `OPENAI_API_KEY` (and the optional `OPENAI_JOB_PARSER_MODEL` override) with a comment to `.env.example` — verify the file documents both variables

## 2. Data model

- [x] 2.1 Add the `JobWorkModel` enum (`REMOTE`, `HYBRID`, `ONSITE`) and the `JobPosting` model to `prisma/schema.prisma` per design decision 3 (plain `userId` string, no relation to `User`; `String[]` list fields; `rawText` as `@db.Text`; `@@index([userId, createdAt])`; `@@map("job_posting")`) — verify `npx prisma validate` succeeds
- [x] 2.2 Run `npx prisma migrate dev --name add_job_posting` against the local Docker Postgres, then `npx prisma generate` — verify the migration applies and the `job_posting` table exists

## 3. Validation

- [x] 3.1 Add `lib/validation/job-posting.ts` with `jobPostingSchema` (OpenAI-strict-compatible: `.nullable()` only, no preprocess), `rawJobPostingSchema` (trimmed, 50–20,000 chars), `jobPostingFormSchema` (extends core with non-empty `title` and `rawText`), the `JobPostingData` type, and a FormData normalizer (empty string → `null`, one-per-line textarea → trimmed non-empty string array) — verify `npx tsc --noEmit` passes

## 4. AI parser

- [x] 4.1 Add `lib/ai/provider.ts` creating the OpenAI provider and exporting `jobParserModel` (model id from `OPENAI_JOB_PARSER_MODEL`, with a small current OpenAI model as default) — verify it is the only file importing `@ai-sdk/openai` (`grep -r "@ai-sdk/openai" app lib components`) and `npx tsc --noEmit` passes
- [x] 4.2 Add `lib/ai/job-parser.ts` exporting `parseJobPosting(rawText)` using `generateText` + `Output.object({ schema: jobPostingSchema })` and `instructions` that require extracting only stated information, `null`/empty for missing fields, and keeping the posting's original language — verify `npx tsc --noEmit` passes

## 5. Repository

- [x] 5.1 Add `lib/db/repositories/job-postings.ts` with `createJobPosting(userId, data)` and `listJobPostings(userId)` (filtered by `userId`, ordered `createdAt desc`, selecting `id`, `title`, `company`, `createdAt`) — verify `npx tsc --noEmit` passes

## 6. Server Actions

- [x] 6.1 Add `app/jobs/actions.ts` with `parseJobPostingAction`: calls `requireSession()`, validates with `rawJobPostingSchema` (no AI call on invalid input), calls `parseJobPosting`, returns `{ rawText, extracted }`, and on any error logs it and returns `{ rawText, error: "Não foi possível analisar a vaga. Tente novamente." }` without touching the database — verify `npx tsc --noEmit` passes
- [x] 6.2 Add `createJobPostingAction`: calls `requireSession()`, normalizes FormData and validates with `jobPostingFormSchema` (returning field errors), calls `createJobPosting`, then `revalidatePath("/jobs")` and `redirect("/jobs")` — verify `npx tsc --noEmit` passes

## 7. UI

- [x] 7.1 Add `components/jobs/new-job-posting-flow.tsx` (client): paste step (textarea, "Analisar vaga" button disabled with "Analisando vaga…" while pending, error message, text preserved) and review step (inputs for scalar fields, select for work model with pt-BR labels, one-per-line textareas for lists, hidden `rawText`, field errors, "Salvar vaga" and "Voltar" which returns to the paste step with the text intact) — verify `npm run lint` passes
- [x] 7.2 Add `app/jobs/new/page.tsx` gated by `requireSession()` rendering the flow — verify visiting `/jobs/new` signed out redirects to `/login`
- [x] 7.3 Add `app/jobs/page.tsx` gated by `requireSession()` listing the candidate's postings (title, company, `pt-BR` saved date), an empty state with a call to add the first posting, and a "Nova vaga" link — verify visiting `/jobs` signed out redirects to `/login` and signed in with no postings shows the empty state
- [x] 7.4 Add a "Minhas vagas" link to `/jobs` in `app/dashboard/page.tsx` next to "Meu perfil" — verify the link navigates to `/jobs`

## 8. Integration checks

- [x] 8.1 Run `npm run lint` and `npm run build` — verify both succeed
- [x] 8.2 With a valid `OPENAI_API_KEY`, paste a complete Portuguese job posting at `/jobs/new` — verify the review form is pre-filled with the stated fields in Portuguese, nothing appears in `/jobs` before confirming, and after "Salvar vaga" the posting appears first in `/jobs` with the raw text stored in `job_posting.rawText`
- [x] 8.3 Paste a posting without salary or company — verify those fields come back empty rather than invented
- [x] 8.4 Submit text under 50 characters, then clear the title in the review form and save — verify each is rejected with a validation message and no AI call / no row is created respectively
- [x] 8.5 Temporarily set an invalid `OPENAI_API_KEY` and analyze a posting — verify the generic error appears, the pasted text is preserved, and no row is saved
- [x] 8.6 Sign in as a second candidate — verify `/jobs` does not show the first candidate's postings
