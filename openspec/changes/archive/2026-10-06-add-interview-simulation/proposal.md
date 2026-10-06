# Proposal

## Why

Candidates can now generate a resume tailored to a job posting, but they still walk into the real interview unprepared. This change adds the third AI feature planned in `define-platform-architecture`: a mock interview in text chat, run by an AI interviewer that knows the posting and the resume the candidate will present. The saved transcripts are also the input the planned `interview-analysis` capability needs.

## What Changes

- Add interview simulation: a signed-in candidate picks one of their generated resumes, and an AI interviewer runs a mixed interview (behavioral and technical questions, as fits the posting) grounded in that resume and its job posting.
- The interviewer opens the conversation, asks one question per turn (follow-ups count as questions), and closes the interview after 8 questions. The candidate can also end it at any time.
- Interviewer replies stream into the chat as they are written.
- The interview runs in the resume's language (which already follows the posting: Portuguese or English).
- Sessions and their messages are saved. An unfinished interview can be resumed later; a finished one becomes a read-only transcript.
- Add an interviews list, a start page, the chat/transcript page, a "Simular entrevista" entry point on each resume, and a "Minhas entrevistas" dashboard link.

**Out of scope** (later changes): feedback, scores, or analysis of the answers (`interview-analysis`), voice input/output, choosing the interview type or length, deleting sessions, and editing or regenerating messages.

## Capabilities

### New Capabilities

- `interview-simulation`: AI-run, text-chat mock interviews grounded in one of the candidate's generated resumes and its job posting, with streamed replies, a defined end, persistence, resuming of unfinished sessions, and read-only transcripts, all scoped to the owner.

### Modified Capabilities

None. The resume page gains a link to start an interview, but that entry point belongs to `interview-simulation`; no `resume-generation` requirement changes.

## Impact

- New dependency: `@ai-sdk/react` (the `useChat` hook, matching the installed `ai@7`).
- New Prisma models `InterviewSession` (owned by user, related to `Resume`) and `InterviewMessage`, plus a migration.
- New `lib/ai/interviewer.ts` and an `interviewerModel` handle in `lib/ai/provider.ts` (optional `OPENAI_INTERVIEWER_MODEL` override); new `lib/validation/interview.ts` and `lib/db/repositories/interviews.ts`; a non-redirecting session helper in `lib/auth/session.ts`.
- The streaming Route Handler `app/api/interview/chat/route.ts` (the one planned in the architecture design), plus protected pages under `app/interviews` and Server Actions to start and end sessions.
- `app/resumes/[id]/page.tsx` and `app/dashboard/page.tsx` gain links.
