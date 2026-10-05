# Proposal

## Why

Every AI feature planned for twjobs-ai (resume generation, interview simulation, interview analysis) needs structured, reusable candidate data, but today a signed-in candidate has nowhere to enter or manage it. This change builds the candidate profile: the single source of truth for a candidate's personal, academic, and professional data, editable through a CRUD area.

## What Changes

- Add a protected candidate profile area requiring an active session (builds on `user-auth`).
- Add personal information management: headline, phone, location, and a short summary, editable in place.
- Add CRUD for work experience (company, role, period, description).
- Add CRUD for education (institution, degree, period).
- Add CRUD for courses/certifications (name, institution, workload or completion date).
- Add CRUD for projects (name, description, link).
- Add CRUD for useful links (label + URL — e.g. LinkedIn, GitHub, portfolio).
- Add CRUD for skills (name, optional proficiency level).
- Add CRUD for languages (name, proficiency level).
- All profile data is scoped to the signed-in candidate; a candidate can only see and manage their own data.

## Capabilities

### New Capabilities

- `candidate-profile`: single source of truth for a candidate's personal, academic, and professional data (personal info, work experience, education, courses, projects, links, skills, languages), owned and editable only by the signed-in candidate.

### Modified Capabilities

None.

## Impact

- New Prisma models: `CandidateProfile` (1:1 with `User`), `WorkExperience`, `Education`, `Course`, `Project`, `ProfileLink`, `Skill`, `Language` (all scoped to a candidate), plus a migration.
- New protected routes under `app/profile` (or equivalent), reusing `requireSession()` from `lib/auth/session.ts`.
- New Server Actions for each entity's create/update/delete, validated with Zod schemas in `lib/validation`, calling new repository functions in `lib/db/repositories` (per the layering decided in `define-platform-architecture`).
- No changes to `user-auth` or `landing-page`; the landing page's feature description already references this capability.
