# Proposal

## Why

Resume generation, interview simulation, and interview analysis all need a job posting in structured form, but job postings arrive as unstructured text copied from job boards. This change lets a signed-in candidate paste a raw job posting, have an AI model extract it into structured fields, review/correct the result, and save it — the first piece of the `job-postings` capability planned in `define-platform-architecture`.

## What Changes

- Add the AI foundation planned in `define-platform-architecture`: the Vercel AI SDK with the OpenAI provider isolated in `lib/ai/provider.ts`, exposing a `jobParserModel` handle. This is the first AI feature in the codebase.
- Add a job posting parser: the candidate pastes raw job-posting text and the AI extracts title, company, location, work model, employment type, seniority, salary, summary, responsibilities, requirements, nice-to-haves, and benefits. Fields not present in the text come back empty — never invented.
- Add a review step: the extracted fields are shown in an editable form; nothing is saved until the candidate confirms.
- Add saving of the reviewed job posting (plus the original raw text) scoped to the signed-in candidate.
- Add a simple list of the candidate's saved job postings and a link to it from the dashboard.

**Out of scope** (later changes): viewing a single posting in detail, editing or deleting saved postings, importing a posting from a URL, and anything that consumes postings (resume, interview).

## Capabilities

### New Capabilities

- `job-postings`: capture of job postings for a candidate — AI-based structured extraction from pasted raw text, candidate review before saving, persistence scoped to the owner, and listing of saved postings.

### Modified Capabilities

None.

## Impact

- New dependencies: `ai` and `@ai-sdk/openai`.
- New environment variable: `OPENAI_API_KEY` (added to `.env.example`).
- New Prisma model `JobPosting` (owned by `User`) plus a migration.
- New `lib/ai/provider.ts` and `lib/ai/job-parser.ts`, `lib/validation/job-posting.ts`, `lib/db/repositories/job-postings.ts`.
- New protected routes `app/jobs` (list) and `app/jobs/new` (paste → review → save) with Server Actions; dashboard gains a "Minhas vagas" link.
- No changes to existing `user-auth`, `candidate-profile`, or `landing-page` behavior.
