# Design

## Context

Both inputs already exist. The candidate profile is a set of Prisma models under `CandidateProfile`: personal info plus `WorkExperience`, `Education`, `Course`, `Project`, `ProfileLink`, `Skill`, and `Language`, with list repositories scoped by `userId`. Saved job postings are `JobPosting` rows with structured fields in the posting's original language (`add-job-posting-parser`). The AI layer is `lib/ai/provider.ts`, which exports per-feature model handles; features call AI SDK v7 `generateText` + `Output.object` with a Zod schema that is compatible with OpenAI strict mode (`.nullable()` only, no transforms). `define-platform-architecture` decided on `@react-pdf/renderer` with the template in `lib/pdf/resume-template.tsx`. Next 16 already treats `@react-pdf/renderer` as a server-external package. Route Handlers receive `params` as a Promise.

See `proposal.md` for motivation and `specs/resume-generation/spec.md` for the requirements.

## Goals / Non-Goals

**Goals:**
- Make "never invent" a structural guarantee for factual data, not only a prompt instruction.
- Use one resume content shape for the view page and the PDF, so both always match.
- Save resumes as immutable snapshots.

**Non-Goals:**
- Editing generated content, multiple templates, custom fonts or branding in the PDF.
- Streaming the generation (a single awaited call with a pending state is enough, as with the parser).
- Automated tests (the repo has no test runner). Verification is `lint`/`build` plus manual checks with a real key.

## Decisions

**1. The AI returns references and wording; code assembles the facts.**
The model receives the profile as JSON in which every item carries its database `id`, plus the job posting's structured fields. It returns a *draft* (`resumeDraftSchema`):
`{ language: "pt-BR" | "en", headline, summary, experiences: [{ id, highlights: string[] }], educationIds: string[], courseIds: string[], projects: [{ id, description }], skills: string[], languageIds: string[] }`.
`lib/resume/assemble.ts` then builds the final content. It looks up each referenced id in the profile and copies company, role, dates, institution, degree, course data, project name and link, and language and proficiency from the database row. It drops unknown or duplicate ids. It keeps only skills that match a profile skill name (case-insensitive, after trimming) and uses the profile's spelling. It takes contact data from the session user (name, email) and the profile (phone, location, links). The model's output order becomes the section order.
*Why*: the spec's "never invents" requirement covers factual fields. With this design a hallucinated company, date, or skill has nowhere to go. Only the free-text parts (headline, summary, highlights, project descriptions) depend on the instructions, which forbid claims not supported by the profile.
*Alternatives considered*: letting the model emit the full resume and validating afterwards (rejected — needs fuzzy matching of facts and silently mixes in invented data); sending no ids and matching by name (rejected — ambiguous when two items share a name).

**2. Language is decided by the model, restricted to `pt-BR` | `en`.**
The instructions say: use `pt-BR` if the posting is in Portuguese, otherwise `en`, and write every text field in that language. Section headings, period formatting ("jan/2022 – atual" / "Jan 2022 – Present"), and proficiency labels come from `lib/resume/labels.ts`, keyed by `language`, and the view and the PDF share them.
*Why*: the model already reads the posting, so a separate language-detection dependency isn't justified. Fixed headings stay consistent and never get "translated" differently between resumes.

**3. Stored content is a validated JSON snapshot.**
New model `Resume { id, userId, jobPostingId → JobPosting (onDelete: Cascade), language String, content Json, createdAt }` with `@@index([userId, createdAt])`, mapped to `resume`. `userId` is a plain string with no relation to `User`, like the other application models. `content` holds the assembled `resumeContentSchema` object, with dates as ISO strings. It is parsed with the same schema when read, so a malformed row fails loudly instead of rendering garbage.
*Why*: a resume is a document snapshot (spec: it doesn't change when the profile does). Normalizing it into child tables would duplicate the profile schema for data that is never queried by field. This differs on purpose from `JobPosting`, whose fields later features will read individually.
*Alternatives considered*: storing only the draft and re-assembling from the live profile at render time (rejected — breaks the snapshot requirement and crashes when a referenced item is deleted).

**4. Generation runs in a Server Action; the PDF in a Route Handler.**
- `app/resumes/actions.ts` → `generateResumeAction(prevState, formData)`: `requireSession()`; validate `jobPostingId`; load the posting with `getJobPosting(userId, id)` (not found → error, no AI call); load the profile with `getFullProfile(userId)` (no experience, education, project, or skill → error with a link to `/profile`, no AI call); `writeResumeDraft(profile, posting)`; `assembleResume(...)`; `createResume(...)`; `redirect(\`/resumes/${id}\`)`. AI and validation errors map to one generic pt-BR message and are logged. Nothing is saved before assembly succeeds.
- `app/resumes/[id]/pdf/route.ts` → `GET`: `requireSession()` (redirects as on pages); `getResume(userId, id)` or a 404; `renderResumePdf(content)` from `lib/pdf/resume-template.tsx` (wraps `renderToBuffer`, so the `.ts` route needs no JSX); response with `Content-Type: application/pdf` and `Content-Disposition: attachment; filename="curriculo-<name>-<job-title>.pdf"`, where the name parts are slugified to ASCII.
*Why*: same orchestration pattern as `add-job-posting-parser`. A file download needs a real HTTP response, which is what Route Handlers are for.

**5. Pages and entry points.**
- `/resumes/new?jobPostingId=…`: server page that lists the candidate's postings in a `<select>` (preselecting the query param when it is theirs). With no postings, it shows an empty message linking to `/jobs/new`. With an empty profile, it shows the profile message up front (the action re-checks). A client form uses `useActionState` and shows "Gerando currículo…" while pending.
- `/resumes`: list from `listResumes(userId)` (includes posting title and company, newest first), empty state, "Gerar currículo" button.
- `/resumes/[id]`: `components/resumes/resume-view.tsx` renders the content in the same section order as the PDF, with "Baixar PDF" (link to `/resumes/[id]/pdf`) and "Voltar". Calls `notFound()` when the resume isn't the candidate's.
- `app/jobs/page.tsx`: each item gets a "Gerar currículo" link to `/resumes/new?jobPostingId=<id>`. `app/dashboard/page.tsx`: "Meus currículos" link.

**6. Repository additions.**
`candidate-profile.ts`: `getFullProfile(userId)` (profile, created lazily like `getOrCreateProfile`, with all seven lists included and ordered as on `/profile`). `job-postings.ts`: `getJobPosting(userId, id)` (`findFirst` scoped by `userId`). New `resumes.ts`: `createResume`, `listResumes`, `getResume(userId, id)`, all filtered by `userId`.

**7. Model handle.**
`provider.ts` gains `resumeWriterModel` (`OPENAI_RESUME_WRITER_MODEL`, default `gpt-5.4-mini`, the same default as the parser). `lib/ai/resume-writer.ts` owns the instructions and a 90 s timeout. This call has more input and output than parsing.

## Risks / Trade-offs

- [Risk] Free-text fields (summary, highlights) could still claim experience the candidate doesn't have → Mitigation: explicit instructions to reword only what the profile supports and never add technologies or achievements; facts are assembled by code (Decision 1). Manual editing is a planned follow-up.
- [Risk] The PDF's built-in Helvetica uses WinAnsi encoding: Portuguese accents work, but characters such as emoji or some symbols would render wrong → Mitigation: instructions ask for plain text without emoji or decorative symbols, and the assembler strips characters outside the WinAnsi range from AI text fields.
- [Risk] Profiles with many entries make prompts long and slow → Mitigation: send only the fields the resume uses (no timestamps or profile ids); a 90 s timeout and pending UI.
- [Risk] A posting that is mostly English but contains a few Portuguese words could be classified either way → accepted; the result is still a coherent single-language resume, and regenerating is cheap.
- [Trade-off] `content` as JSON can't be queried or migrated per field → accepted for a snapshot document; the Zod parse on read catches shape drift. A future template change that needs new fields will have to handle old snapshots.

## Migration Plan

Additive: one new table with a foreign key to `job_posting`, one migration, one new dependency, one optional env var. Build order: dependency, schema and migration, content and draft schemas, labels and assembler, repositories, AI writer, Server Action, pages, PDF template and route, entry-point links. Rollback is dropping the migration and the new routes.
