# Proposal

## Why

Every other planned capability (candidate profile, job postings, resumes, interviews) belongs to a specific candidate, so the platform needs accounts before any of them can be built. This change implements the `user-auth` capability — registration, login, logout — and a protected dashboard boilerplate that proves a session actually gates access, so later capabilities have an authenticated area to land in.

## What Changes

- Add candidate registration with name, email, and password.
- Add login with email and password.
- Add logout.
- Add a session-protected `/dashboard` route: unauthenticated visitors are redirected to `/login`; authenticated visitors see their account info and a logout action. This is a boilerplate screen whose only job is to prove the session works end-to-end — later changes replace its content as real capabilities (profile, jobs, etc.) land.
- Wire the landing page's existing `/register` and `/login` links (added in `add-landing-page`, currently dead) to real pages.
- Establish the project's first database: PostgreSQL for local development via Docker Compose, with Prisma managing the schema/migrations.
- Add Better-Auth for credential storage/hashing and session management, per `define-platform-architecture`'s design decision.

## Capabilities

### New Capabilities

- `user-auth`: candidate registration, login, logout, and session-based access control, including the baseline protected dashboard area.

### Modified Capabilities

None.

## Impact

- New dependencies: `prisma`, `@prisma/client`, `better-auth`, `zod`.
- New `docker-compose.yml` providing a local PostgreSQL instance for development.
- New Prisma schema and initial migration (Better-Auth's user/session/account tables).
- New routes: `app/register/page.tsx`, `app/login/page.tsx`, `app/dashboard/page.tsx`, the Better-Auth route handler (`app/api/auth/[...all]/route.ts`), and a logout action.
- `app/page.tsx`'s existing call-to-action links now resolve to working pages instead of 404ing.
