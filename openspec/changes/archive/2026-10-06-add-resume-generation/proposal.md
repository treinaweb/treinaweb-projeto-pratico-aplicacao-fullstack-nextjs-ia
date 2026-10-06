# Proposal

## Why

Candidates can now keep their profile and save the job postings they care about, but they still have to write a tailored resume for each posting by hand — the core pain the platform exists to solve (see `define-platform-architecture/proposal.md`). With both inputs now structured, this change lets the AI produce a resume tailored to a specific saved posting from the candidate's profile, ready to export as PDF.

## What Changes

- Add resume generation: a signed-in candidate picks one of their saved job postings and asks for a resume; the AI selects the relevant profile items, orders them for the posting, and rewrites the headline, summary, experience highlights, and project descriptions with the posting in focus.
- The AI MUST NOT invent anything: factual data (companies, roles, dates, institutions, courses, skills, languages, contact info) comes only from the profile; the AI only chooses, orders, and rewrites wording.
- The resume is written in the same language as the job posting (Portuguese or English; other languages fall back to English).
- Generated resumes are saved as a snapshot (later profile edits don't change them); a candidate can have several resumes per posting.
- Add a resumes list, a resume view page, and PDF export of a saved resume.
- Add a "Gerar currículo" entry point on each saved job posting and a "Meus currículos" link on the dashboard.

**Out of scope** (later changes): manually editing a generated resume, multiple visual templates, deleting resumes, sharing resumes by link, and using resumes in interview simulation.

## Capabilities

### New Capabilities

- `resume-generation`: AI generation of a resume tailored to one of the candidate's saved job postings from their profile data, without inventing information; persistence of generated resumes scoped to their owner; listing, viewing, and PDF export.

### Modified Capabilities

None. The job postings list gains a link to start generation, but that is an entry point owned by `resume-generation`; no `job-postings` requirement changes.

## Impact

- New dependency: `@react-pdf/renderer` (already on Next.js's automatic server-external list, so no `next.config.ts` change).
- New Prisma model `Resume` (owned by user, related to `JobPosting`) plus a migration.
- New `lib/ai/resume-writer.ts` and a `resumeWriterModel` handle in `lib/ai/provider.ts`; new `lib/validation/resume.ts`, `lib/db/repositories/resumes.ts`, a read of the full profile and of a single job posting from the existing repositories, and `lib/pdf/resume-template.tsx`.
- New protected routes under `app/resumes` (list, generate, view) and a PDF Route Handler; `app/jobs/page.tsx` and `app/dashboard/page.tsx` gain links.
- Uses the existing `OPENAI_API_KEY`; optional `OPENAI_RESUME_WRITER_MODEL` override.
