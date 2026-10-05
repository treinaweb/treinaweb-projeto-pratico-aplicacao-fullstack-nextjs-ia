# Proposal

## Why

Candidates applying to jobs struggle to tailor their resumes to each posting and to prepare for interviews. This change builds the MVP of twjobs-ai: a platform that stores a candidate's professional data once and uses AI to turn it into a job-tailored resume, a simulated interview, and actionable feedback. It is scoped as an MVP to validate the concept, but the technical foundation must be solid enough to evolve into a real product.

## What Changes

- Add candidate registration and login.
- Add a candidate profile that acts as the single source of truth for academic and professional data (education, experience, skills, languages, links), reused by every AI feature.
- Add job posting capture: the candidate pastes raw job-posting text, an AI model extracts it into structured fields, the candidate reviews/edits before saving.
- Add AI-generated resumes tailored to a specific job + candidate profile, exportable as PDF.
- Add an AI-simulated interview (text chat) grounded in the job posting and the candidate's profile/resume.
- Add AI analysis of a completed interview session: strengths, weaknesses, improvement suggestions, and a score.
- Establish the technical foundation for all AI features: Vercel AI SDK with the model provider (OpenAI) isolated behind a single module so it can be swapped later without touching feature code.

## Capabilities

### New Capabilities

- `user-auth`: candidate registration, login, and session management.
- `candidate-profile`: single source of truth for a candidate's academic and professional data, consumed by resume generation, interview simulation, and interview analysis.
- `job-postings`: capture and management of job postings, including AI-based structured extraction from pasted raw text.
- `resume-generation`: AI-tailored resume generation for a specific job + candidate profile, with PDF export.
- `interview-simulation`: AI-driven, text-chat mock interview grounded in a job posting and the candidate's profile/resume.
- `interview-analysis`: AI evaluation of a completed interview session, producing strengths, weaknesses, improvement suggestions, and a score.

### Modified Capabilities

None — this is a greenfield project (current repo is an unmodified `create-next-app` scaffold).

## Impact

- New Next.js (App Router) routes, Server Actions, and one streaming Route Handler (interview chat).
- New dependencies: `ai`, `@ai-sdk/openai`, `prisma` + `@prisma/client`, `better-auth`, `zod`, `@react-pdf/renderer`, `shadcn/ui`.
- New PostgreSQL database (schema managed via Prisma migrations).
- No existing functionality is affected; this establishes the application from its current blank-slate state.
