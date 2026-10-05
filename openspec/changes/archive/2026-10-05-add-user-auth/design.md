# Design

## Context

This is the project's first capability needing a real database. See `proposal.md` for motivation; see `define-platform-architecture/design.md` for the already-decided foundation this builds on: PostgreSQL + Prisma behind `lib/db/repositories`, Better-Auth behind `lib/auth`, one Zod schema per entity, and `app/` only orchestrating (validate → call `lib/*` → return).

Two library landscapes changed enough recently that this design pins exact versions and shapes rather than assuming prior knowledge:
- **Prisma ORM** currently has `8.0.0-rc.*` tagged `latest` on npm, with a materially different CLI/config surface (no `schema.prisma`, a new `@prisma/orm-postgres` package). The last stable line is `7.10.0`, which itself changed significantly from Prisma 6: the datasource `url` moved out of `schema.prisma` into a new `prisma.config.ts`, and `PrismaClient` requires an explicit driver adapter (`@prisma/adapter-pg`) — `new PrismaClient()` with no adapter no longer works.
- **Next.js 16** (already in this repo) renamed `middleware.ts` to `proxy.ts` and explicitly recommends verifying authentication inside each Server Function/page rather than relying on it alone.

Development database: local PostgreSQL via Docker Compose (confirmed with the user), not a hosted free tier — keeps the course/dev loop independent of external accounts.

## Goals / Non-Goals

**Goals:**
- Stand up the project's first database (local Postgres) and the Prisma + Better-Auth plumbing, pinned to versions that actually work together today.
- Implement registration, login, logout, and a protected `/dashboard` boilerplate, matching `specs/user-auth/spec.md`.
- Keep every vendor call (Prisma client, Better-Auth) behind `lib/auth/*` and `lib/db/*`, per the architecture's layering decision.

**Non-Goals:**
- Email verification and password-reset flows — deferred, consistent with the MVP framing in `define-platform-architecture`.
- OAuth/social login — already deferred at the architecture level.
- A shared `proxy.ts`-based route gate — with a single protected route today, a per-page check is simpler; revisit if many more protected routes appear.
- An automated test suite for the auth flow — this project has no test framework installed yet; verification here is manual (lint, build, browser), matching the precedent set by `add-landing-page`.

## Decisions

**1. Pin the Prisma toolchain to `7.10.0` and use its driver-adapter-only setup.**
`prisma`, `@prisma/client`, and `@prisma/adapter-pg` are all pinned to `7.10.0` (not `^7.10.0`). `prisma/schema.prisma` has no `url` in its `datasource` block; the connection string lives in a root `prisma.config.ts` (reads `DATABASE_URL` via `dotenv/config`). `lib/db/client.ts` builds a `PrismaPg` adapter from `DATABASE_URL` and passes it to `new PrismaClient({ adapter })` — the only supported construction in this version.
*Why*: installing unpinned `prisma`/`@prisma/client` today pulls mismatched versions (an `8.0.0-rc` CLI against a `7.x` client, or vice versa) with an incompatible config format. Pinning both to the same known-good stable version avoids that entirely.
*Alternatives considered*: letting npm resolve "latest" (rejected — resolves to a release candidate with a different CLI surface); Prisma Postgres hosted/Accelerate (rejected — the user wants local Docker Postgres for now).

**2. Better-Auth owns the schema; Prisma migrates it.**
`lib/auth/server.ts` configures `betterAuth({ database: prismaAdapter(prisma, { provider: "postgresql" }), emailAndPassword: { enabled: true } })`. Its default `User`/`Session`/`Account`/`Verification` models are generated into `prisma/schema.prisma` via Better-Auth's CLI (`npx auth generate --config lib/auth/server.ts`), then applied with `npx prisma migrate dev`.
*Why*: this is the documented Better-Auth + Prisma integration path, and it keeps one migration history instead of two separate schema-management tools.
*Alternatives considered*: hand-writing the Better-Auth tables (rejected — the CLI output is the contract Better-Auth tests against; hand-written models risk drifting from what the library expects).

**3. Vendor isolation extends to auth: `app/` never imports `better-auth` or the generated Prisma client directly.**
`lib/auth/server.ts` exports the `auth` instance and a `requireSession()` helper (wraps `auth.api.getSession` + `redirect("/login")`). `lib/auth/client.ts` exports a single `authClient` (`createAuthClient`) for "use client" components. `lib/db/client.ts` exports the singleton Prisma client. Routes and pages only import from these.
*Why*: extends `define-platform-architecture` decision 6 (vendor code stays in `lib/*`) to this capability, so swapping Better-Auth or Prisma later (per that design's risk mitigations) still touches only `lib/auth` or `lib/db`.
*Alternatives considered*: calling `authClient`/`auth.api` directly from page/form components (rejected — faster short-term, but breaks the isolation the architecture design relies on).

**4. Protect `/dashboard` with a per-page server check, not `proxy.ts`.**
`app/dashboard/page.tsx` is a Server Component that calls `requireSession()` at the top, which redirects to `/login` when there is no session.
*Why*: Next.js 16's own `proxy.ts` docs warn that a matcher change can silently remove coverage and recommend verifying auth inside each Server Function/page regardless. With exactly one protected route, a shared proxy gate is complexity this change doesn't need yet.
*Alternatives considered*: a `proxy.ts` matcher on `/dashboard` (rejected for now — adds a second enforcement point for a single route; revisit once several protected routes exist).

**5. Registration/login forms call Better-Auth's client SDK directly; a shared Zod schema adds client-side validation.**
`app/register/page.tsx` and `app/login/page.tsx` are small `"use client"` components that call `authClient.signUp.email(...)` / `authClient.signIn.email(...)` (through `lib/auth/client.ts`), handling `onSuccess`/`onError` to redirect to `/dashboard` or show an error. `lib/validation/auth.ts` defines `registerSchema`/`loginSchema` (Zod), used for inline client-side validation before the call is made.
*Why*: Better-Auth's own route handler is already the authoritative, secure server boundary (credential hashing, duplicate-email handling, password-length checks) — wrapping it in a redundant Server Action would duplicate validation without adding security. The Zod schema still gives immediate field-level feedback, matching the architecture's "one schema per entity" principle.
*Alternatives considered*: Server Actions that call `auth.api.signUpEmail`/`signInEmail` server-side (rejected — same security boundary, extra indirection for no benefit here).

**6. Introduce shadcn/ui now, for the first real forms.**
`shadcn/ui` (already listed as a planned dependency in `define-platform-architecture`) is initialized in this change; register/login use its `Input`, `Label`, `Button`, and `Card` components, kept visually consistent with the landing page's existing Tailwind styling.
*Why*: this is the first feature needing real form controls; introducing the planned component library here avoids hand-rolling form styling now and restyling later.
*Alternatives considered*: plain Tailwind markup like the landing page (rejected — would need redoing once shadcn/ui is introduced for the next form-heavy capability anyway).

## Risks / Trade-offs

- [Risk] Better-Auth's CLI generator may not perfectly target Prisma 7's custom client output path (both are recent surfaces) → Mitigation: after running `npx auth generate`, diff the resulting models against Better-Auth's documented core schema (User/Session/Account/Verification) before migrating; write them by hand if the CLI output is wrong. Confirmed during implementation: the generator output itself was correct, but `prisma migrate dev` did not reliably refresh the generated client's embedded `runtimeDataModel` (which Better-Auth's Prisma adapter reads to validate the schema) — always run `npx prisma generate` explicitly right after any schema change, don't rely on `migrate dev` alone.
- [Risk] The database only exists if a developer remembers to run `docker compose up -d` → Mitigation: this is a one-command, documented step; acceptable for local MVP development.
- [Risk] Pinning `prisma`/`@prisma/client`/`@prisma/adapter-pg` to `7.10.0` means they won't auto-update → Mitigation: intentional; revisit the pin once Prisma 8 is stable and Better-Auth documents support for it.
- [Trade-off] Skipping email verification means an account is usable immediately with an unverified email → accepted for MVP; flagged as a clear follow-up when real users are onboarded.

## Migration Plan

Greenfield addition — no existing data. Order: local Postgres (Docker) → Prisma toolchain + empty schema → Better-Auth config → generate schema → migrate → route handler → forms → protected dashboard. Each step is independently verifiable before the next starts (see `tasks.md`).
