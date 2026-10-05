# Tasks

## 1. Local database

- [x] 1.1 Add `docker-compose.yml` with a PostgreSQL service (named volume, port 5432) and a `.env.example` documenting `DATABASE_URL` for it — verify by running `docker compose up -d` and confirming `docker compose ps` shows the service healthy
- [x] 1.2 Add a local `.env` (git-ignored) with `DATABASE_URL` pointing at the Docker Postgres instance — verify `psql "$DATABASE_URL" -c '\conninfo'` (or `docker compose exec db psql -U postgres -c '\conninfo'`) connects successfully

## 2. Prisma toolchain

- [x] 2.1 Install `prisma@7.10.0`, `@prisma/client@7.10.0`, `@prisma/adapter-pg@7.10.0`, `pg`, and `dotenv` (pinned, not `^7.10.0`) — verify `npx prisma -v` reports `7.10.0`
- [x] 2.2 Add `prisma/schema.prisma` (generator with a custom `output`, `datasource db { provider = "postgresql" }`, no `url` field, no models yet) and root `prisma.config.ts` reading `DATABASE_URL` via `dotenv/config` — verify `npx prisma validate` succeeds
- [x] 2.3 Add `lib/db/client.ts`: a singleton `PrismaClient` constructed with a `PrismaPg` adapter built from `DATABASE_URL` — verify `npx prisma generate` succeeds and the generated client can be imported without a type error (`npx tsc --noEmit`)

## 3. Better-Auth configuration and schema

- [x] 3.1 Install `better-auth` and `zod` — verify both appear in `package.json`
- [x] 3.2 Add `lib/auth/server.ts` exporting the `auth` instance (`betterAuth`) configured with `prismaAdapter(prisma, { provider: "postgresql" })` from `lib/db/client.ts` and `emailAndPassword: { enabled: true }` — verify the file type-checks (`npx tsc --noEmit`)
- [x] 3.3 Run `npx auth generate --config lib/auth/server.ts` to add Better-Auth's `User`/`Session`/`Account`/`Verification` models into `prisma/schema.prisma` — verify the generated models match Better-Auth's documented core schema (field names, `@@map` table names); if they don't, add them by hand instead
- [x] 3.4 Run `npx prisma migrate dev --name add_better_auth_schema` against the local Docker Postgres — verify the migration applies cleanly and `user`/`session`/`account`/`verification` tables exist (`npx prisma studio` or `psql \dt`)
- [x] 3.5 Add `lib/auth/client.ts` exporting a single `authClient` (`createAuthClient`) for use from `"use client"` components — verify it type-checks
- [x] 3.6 Add `app/api/auth/[...all]/route.ts` using `toNextJsHandler(auth)` to export `GET`/`POST` — verify `npm run dev` starts cleanly and `curl -i http://localhost:3000/api/auth/session` returns a JSON response (not a 404/500)

## 4. Registration

- [x] 4.1 Add `lib/validation/auth.ts` with a Zod `registerSchema` (name required, valid email, password min length 8) and `loginSchema` (email, password) — verify both are exported and type-check
- [x] 4.2 Initialize shadcn/ui and add its `Button`, `Input`, `Label`, and `Card` components — verify `npx shadcn@latest add button input label card` completes and the components render in a throwaway page without error
- [x] 4.3 Add `app/register/page.tsx`: a `"use client"` form (name, email, password) validated inline with `registerSchema`, calling `authClient.signUp.email`, redirecting to `/dashboard` on success and showing the returned error message on failure — verify by registering a new account in the browser and confirming the redirect to `/dashboard` with a live session
- [x] 4.4 Verify duplicate-email registration: submit the registration form again with the same email and confirm no new account is created and an "email already in use" error is shown, matching `specs/user-auth/spec.md`'s "Email already registered" scenario
- [x] 4.5 Verify invalid input: submit the form with a malformed email and with a password under 8 characters and confirm inline validation blocks submission in both cases, matching the "Invalid registration input" scenario

## 5. Login

- [x] 5.1 Add `app/login/page.tsx`: a `"use client"` form (email, password) validated inline with `loginSchema`, calling `authClient.signIn.email`, redirecting to `/dashboard` on success and showing a generic invalid-credentials error on failure — verify by logging in with the account created in 4.3 and confirming the redirect to `/dashboard`
- [x] 5.2 Verify incorrect credentials: submit the login form with a wrong password for an existing account and confirm no session is established and the generic error is shown, matching the "Incorrect credentials" scenario

## 6. Protected dashboard and logout

- [x] 6.1 Add `lib/auth/session.ts` exporting `requireSession()`: calls `auth.api.getSession` with the incoming request headers and redirects to `/login` when there is no session — verify it type-checks
- [x] 6.2 Add `app/dashboard/page.tsx`: a Server Component that calls `requireSession()` and renders the candidate's name and email plus a logout control — verify by visiting `/dashboard` while signed in and seeing the account info
- [x] 6.3 Add a logout client component that calls `authClient.signOut()` and redirects to `/` on completion, used on the dashboard — verify clicking it ends the session and returns to the home page
- [x] 6.4 Verify unauthenticated access: clear cookies (or use an incognito window) and request `/dashboard` directly, confirming a redirect to `/login`, matching the "Unauthenticated access to a protected area" scenario
- [x] 6.5 Verify post-logout access: after logging out, request `/dashboard` again and confirm the same redirect to `/login`

## 7. Wiring and final verification

- [x] 7.1 Confirm the landing page's existing `/register` and `/login` calls-to-action (added in `add-landing-page`) now resolve to the real pages instead of 404ing — no code change expected, verify by clicking both from `/`
- [x] 7.2 Run `npm run lint` and `npm run build` and confirm both succeed
- [x] 7.3 Run a full manual pass in the dev server covering every scenario in `specs/user-auth/spec.md` in one sitting (register, duplicate email, invalid input, login, wrong credentials, protected access unauthenticated/authenticated, logout) and confirm each matches its scenario
