# Design

## Context

The repository is currently an unmodified `create-next-app` scaffold (Next.js 16 App Router, React 19, TypeScript, Tailwind 4) with no database, auth, or AI integration. See `proposal.md` for the motivation and the six capabilities this change introduces (`user-auth`, `candidate-profile`, `job-postings`, `resume-generation`, `interview-simulation`, `interview-analysis`).

The project is an MVP meant to validate the product concept, but is explicitly intended to evolve into a real product. This design favors choices that are production-capable from day one (e.g., Postgres over SQLite) while avoiding infrastructure the MVP doesn't need yet (e.g., job queues).

## Goals / Non-Goals

**Goals:**
- Define the technical foundation (stack + module layering) shared by every capability in the proposal.
- Make the LLM provider swappable without touching feature code.
- Isolate the ORM, auth library, and PDF renderer behind single modules so each can be swapped later without a cross-cutting refactor.

**Non-Goals:**
- Background job/queue processing — AI calls are synchronous for this MVP.
- Multi-tenancy, billing, or team/organization features.
- OAuth/social login providers — noted as a future extension point, not implemented now.
- Field-by-field data schemas per capability — those belong in each capability's spec, not here.

## Decisions

**1. All AI calls go through the Vercel AI SDK, with the provider isolated in one module.**
A single module, `lib/ai/provider.ts`, instantiates the OpenAI provider (`@ai-sdk/openai`) and exports named model handles per feature (e.g. `jobParserModel`, `resumeWriterModel`, `interviewerModel`, `interviewAnalyzerModel`). No other module imports `@ai-sdk/openai` directly; features call `generateObject`/`streamText` with one of these handles.
*Why*: the AI SDK's calling interface (`generateObject`, `streamText`) is identical across providers, so switching OpenAI for Anthropic/Google later is a change to one file and an env var, not to every feature.
*Alternatives considered*: calling the OpenAI SDK directly (rejected — couples every feature to OpenAI's API shape); a custom provider abstraction (rejected — the AI SDK already solves this).

**2. PostgreSQL + Prisma, accessed only through repositories.**
PostgreSQL (hosted on a free tier such as Neon or Supabase for now) via Prisma ORM. All Prisma queries live behind repository functions in `lib/db/repositories/*` (one file per entity); no other module imports the Prisma client directly.
*Why*: the entities (profile, jobs, resumes, interview sessions/messages, analyses) are relational by nature; Postgres has a direct path to production unlike SQLite; Prisma's versioned migrations and type-safe client suit a schema expected to keep evolving.
*Alternatives considered*: SQLite (rejected — would have to be replaced before any real deployment); Drizzle (a reasonable lighter-weight alternative, but Prisma's migration tooling and Studio were judged more valuable for evolving this into a product).

**3. Better-Auth for registration, login, and sessions.**
Better-Auth owns the `user-auth` capability: credential storage/hashing, session management, and the extension point for adding OAuth providers later.
*Why*: TypeScript-first and built for the Next.js App Router + Server Actions pattern already in use; adding a social login (e.g. LinkedIn, a natural fit for a job platform) later doesn't require a redesign.
*Alternatives considered*: Auth.js/NextAuth v5 (more battle-tested, a valid fallback); hand-rolled auth (rejected — unnecessary risk around password/session handling).

**4. One Zod schema per entity, reused across every boundary.**
Each domain entity (candidate profile, job posting, resume, interview analysis, etc.) has exactly one Zod schema, reused for: the AI SDK's `generateObject` structured output, form validation, and Server Action/route input validation.
*Why*: `generateObject` takes a Zod schema directly for structured extraction (job parsing, interview analysis); reusing that schema everywhere else prevents drift between what the AI returns, what gets stored, and what the UI validates.
*Alternatives considered*: separate hand-written types per layer (rejected — duplicate sources of truth that drift over time).

**5. PDF export via `@react-pdf/renderer`.**
Resumes are exported to PDF from a React-component layout defined in `lib/pdf/resume-template.tsx`.
*Why*: renders PDFs directly from React components without a headless browser — lighter and more serverless/Vercel-friendly than a Puppeteer-based approach.
*Alternatives considered*: Puppeteer/headless Chrome HTML-to-PDF (rejected — heavier runtime, worse serverless cold starts); browser print-to-PDF only (rejected — the proposal requires a real exportable PDF, not just an on-screen view).

**6. Layered architecture: `app/` orchestrates, `lib/*` owns vendors.**
`app/` (routes, Server Actions, and the one streaming Route Handler for interview chat) only validates input with Zod, calls a `lib/*` function, and returns the result. Vendor-specific code stays isolated: `lib/ai` (AI SDK/OpenAI), `lib/db/repositories` (Prisma), `lib/auth` (Better-Auth), `lib/pdf` (@react-pdf/renderer).
*Why*: this is the mechanism that makes decisions 1-3 and 5 actually swappable later — only the owning `lib/*` module changes, not every route or action that uses it.
*Alternatives considered*: calling vendor SDKs directly from Server Actions (rejected — faster short-term, but couples the app to each vendor and contradicts the goal of a foundation that can evolve).

**7. Interview simulation is text chat only.**
`interview-simulation` streams text responses (`streamText` + `useChat`) through one Route Handler, `app/api/interview/chat/route.ts`. No speech-to-text/text-to-speech in this MVP.
*Why*: matches the explicit scope decision; avoids audio capture/streaming complexity not needed to validate the product concept.
*Alternatives considered*: voice-based interview (explicitly deferred as materially larger scope).

**8. AI calls run synchronously; no queue/worker infrastructure yet.**
Job parsing, resume generation, and interview analysis are direct, awaited calls inside a Server Action/route handler, with a loading state in the UI.
*Why*: each call is expected to finish in a few seconds; the MVP doesn't justify the operational cost of a queue (e.g. Inngest, BullMQ) yet.
*Alternatives considered*: background job queue for AI calls (deferred, not rejected — since `lib/ai/*` functions are already isolated, moving one behind a worker later doesn't change its public shape).

## Risks / Trade-offs

- [Risk] OpenAI latency/cost on long-context calls (resume generation, interview analysis) → Mitigation: keep prompts scoped to only the needed profile/job fields; provider isolation (decision 1) makes swapping to a cheaper/faster model per task a one-line change.
- [Risk] AI-structured extraction (job parsing, interview analysis) can return malformed or incomplete data → Mitigation: every structured AI output is validated against the same Zod schema used for storage (decision 4); parsed job postings are reviewed/edited by the candidate before saving, never saved blind.
- [Risk] Prisma connection overhead in a serverless (Vercel) deployment → Mitigation: use a pooled Postgres connection (Neon/Supabase pooler) behind a singleton Prisma client (`lib/db/client.ts`).
- [Risk] Better-Auth is younger/less battle-tested than Auth.js → Mitigation: auth is isolated in `lib/auth` (decision 6), so swapping to Auth.js later touches one module, not the rest of the app.
- [Trade-off] Prisma over Drizzle trades some raw performance/edge-runtime flexibility for stronger migration tooling and an easier path for a team to evolve the schema — accepted given the project's "solid foundation" goal.

## Migration Plan

Greenfield project — there is no existing data or running system to migrate. Initial build order: provision Postgres and the Prisma schema, implement `user-auth` and `candidate-profile` first since every other capability depends on them, then `job-postings`, `resume-generation`, `interview-simulation`, and `interview-analysis` in that order, matching the proposal's capability list.
