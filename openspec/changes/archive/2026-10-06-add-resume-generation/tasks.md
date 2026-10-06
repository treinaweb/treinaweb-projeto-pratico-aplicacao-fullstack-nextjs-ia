# Tasks

## 1. Dependencies and configuration

- [x] 1.1 Install `@react-pdf/renderer@^4` as a dependency — verify it appears in `package.json` `dependencies` and `npm ls @react-pdf/renderer` resolves without errors
- [x] 1.2 Document the optional `OPENAI_RESUME_WRITER_MODEL` override in `.env.example` next to `OPENAI_JOB_PARSER_MODEL` — verify the file documents it

## 2. Data model

- [x] 2.1 Add the `Resume` model to `prisma/schema.prisma` per design decision 3 (plain `userId` string, `jobPostingId` relation to `JobPosting` with `onDelete: Cascade` and the back-relation on `JobPosting`, `language String`, `content Json`, `createdAt`, `@@index([userId, createdAt])`, `@@map("resume")`) — verify `npx prisma validate` succeeds
- [x] 2.2 Run `npx prisma migrate dev --name add_resume` against the local Docker Postgres, then `npx prisma generate` — verify the migration applies without asking for a reset and the `resume` table exists with its foreign key to `job_posting`

## 3. Schemas, labels, and assembly

- [x] 3.1 Add `lib/validation/resume.ts` with `resumeLanguageSchema` (`pt-BR` | `en`), `resumeDraftSchema` (AI output per design decision 1, OpenAI-strict-compatible), and `resumeContentSchema` (assembled snapshot with contact, experiences, education, courses, projects, skills, languages; dates as ISO strings) plus their types — verify `npx tsc --noEmit` passes
- [x] 3.2 Add `lib/resume/labels.ts` with section headings, proficiency labels, and period formatting for `pt-BR` ("jan/2022 – atual") and `en` ("Jan 2022 – Present") — verify `npx tsc --noEmit` passes
- [x] 3.3 Add `lib/resume/assemble.ts` with `assembleResume({ draft, profile, user })`: resolves ids against the profile (dropping unknown/duplicate ids), copies factual fields from profile rows, keeps only skills matching profile skills (case-insensitive, profile spelling), takes contact from user + profile, strips non-WinAnsi characters from AI text, and returns data validated by `resumeContentSchema` — verify `npx tsc --noEmit` passes and, with a throwaway `npx tsx` script in the scratchpad, that a draft with an unknown experience id and a skill absent from the profile yields content without either

## 4. Repositories

- [x] 4.1 Add `getFullProfile(userId)` to `lib/db/repositories/candidate-profile.ts` (lazy create, all seven lists included and ordered like `/profile`) and `getJobPosting(userId, id)` to `lib/db/repositories/job-postings.ts` (scoped by `userId`) — verify `npx tsc --noEmit` passes
- [x] 4.2 Add `lib/db/repositories/resumes.ts` with `createResume`, `listResumes` (newest first, including posting title and company), and `getResume(userId, id)` (parses `content` with `resumeContentSchema`), all filtered by `userId` — verify `npx tsc --noEmit` passes

## 5. AI writer

- [x] 5.1 Add `resumeWriterModel` to `lib/ai/provider.ts` (`OPENAI_RESUME_WRITER_MODEL`, default `gpt-5.4-mini`) — verify `@ai-sdk/openai` is still imported only there (`grep -r "@ai-sdk/openai" app lib components`)
- [x] 5.2 Add `lib/ai/resume-writer.ts` exporting `writeResumeDraft(profile, posting)`: `generateText` + `Output.object({ schema: resumeDraftSchema })`, a 90 s timeout, the profile sent as compact JSON with item ids, the posting's structured fields, and instructions covering tailoring, never inventing facts/skills/achievements, the `pt-BR`/`en` language rule, and plain text without emoji — verify `npx tsc --noEmit` passes

## 6. Generation flow

- [x] 6.1 Add `app/resumes/actions.ts` with `generateResumeAction` per design decision 4 (session, posting ownership → not-found error without an AI call, empty-profile error with a `/profile` hint without an AI call, write → assemble → save → `redirect` to `/resumes/<id>`, generic logged error on AI/validation failure with nothing saved) — verify `npx tsc --noEmit` passes
- [x] 6.2 Add `app/resumes/new/page.tsx` (session-gated; posting `<select>` preselected from `?jobPostingId=` when it belongs to the candidate; empty-postings message linking to `/jobs/new`; empty-profile message linking to `/profile`) and `components/resumes/generate-resume-form.tsx` (client, `useActionState`, "Gerando currículo…" while pending, error display) — verify `npm run lint` passes and `/resumes/new` signed out redirects to `/login`

## 7. Viewing and listing

- [x] 7.1 Add `components/resumes/resume-view.tsx` rendering contact header, headline, summary, and the experience/education/courses/projects/skills/languages sections (skipping empty ones) with headings and periods from `lib/resume/labels.ts` — verify `npm run lint` passes
- [x] 7.2 Add `app/resumes/[id]/page.tsx` (session-gated, `notFound()` for missing or foreign resumes) with "Baixar PDF" and "Voltar" — verify an unknown id renders the 404 page
- [x] 7.3 Add `app/resumes/page.tsx` listing resumes (posting title, company, `pt-BR` date, link to the view) with an empty state and a "Gerar currículo" button — verify signed out redirects to `/login` and signed in with no resumes shows the empty state

## 8. PDF export

- [x] 8.1 Add `lib/pdf/resume-template.tsx` with a `ResumeDocument` component mirroring `resume-view.tsx`'s section order and labels, and `renderResumePdf(content)` returning a `Buffer` via `renderToBuffer` — verify `npx tsc --noEmit` passes
- [x] 8.2 Add `app/resumes/[id]/pdf/route.ts` (`GET`: session, `getResume` or 404, `renderResumePdf`, `application/pdf` with an ASCII-slugified `attachment` filename `curriculo-<name>-<job-title>.pdf`) — verify `npm run build` succeeds and a request for a foreign or unknown id returns 404

## 9. Entry points

- [x] 9.1 Add a "Gerar currículo" link to each item in `app/jobs/page.tsx` pointing to `/resumes/new?jobPostingId=<id>`, and a "Meus currículos" link to `/resumes` in `app/dashboard/page.tsx` — verify both links navigate to the expected pages with the posting preselected

## 10. Integration checks

- [x] 10.1 Run `npm run lint` and `npm run build` — verify both succeed
- [x] 10.2 With a filled-in test profile and a saved Portuguese posting, generate a resume — verify it redirects to the view, headings and text are in Portuguese, every experience/education/course/project/language matches a profile row exactly, skills are a subset of profile skills, and contact comes from the account/profile
- [x] 10.3 Generate for an English posting that requires a skill absent from the profile — verify the resume is in English and the missing skill is not claimed
- [x] 10.4 Download the PDF of a generated resume — verify it is a valid PDF (`file` reports PDF), has the expected filename, contains the same sections as the view, and renders Portuguese accents correctly
- [x] 10.5 Edit the profile after generating, and generate a second resume for the same posting — verify the first resume is unchanged and both appear in `/resumes`, newest first
- [x] 10.6 Try generating with an empty profile, and with an invalid `OPENAI_API_KEY` on a server started for that check — verify each shows its error message and no `resume` row is created
- [x] 10.7 As a second candidate, open the first candidate's resume view and PDF URLs and post their `jobPostingId` to the action — verify 404/not-found responses and no resume created
