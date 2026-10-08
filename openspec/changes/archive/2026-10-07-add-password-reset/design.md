# Design

## Context

- Better Auth 1.7 (`lib/auth/server.ts`, `emailAndPassword.enabled`) already ships the reset endpoints. Behavior read from `node_modules/better-auth/dist/api/routes/password.mjs`:
  - `POST /request-password-reset { email, redirectTo }` answers the same `{ status: true }` whether or not the email exists. For an existing email it stores a token in the `verification` table (`reset-password:<token>`, default 1h) and calls `emailAndPassword.sendResetPassword({ user, url, token })`. Without that callback it answers `RESET_PASSWORD_DISABLED`.
  - The emailed `url` is `<BETTER_AUTH_URL>/api/auth/reset-password/<token>?callbackURL=<redirectTo>`. That GET redirects to `<redirectTo>?token=<token>` when the token is valid, or to `<redirectTo>?error=INVALID_TOKEN` when it is missing, unknown, or expired.
  - `POST /reset-password { newPassword, token }` consumes the token (single use, and rejected once expired), checks the minimum length (`PASSWORD_TOO_SHORT`), updates the hash, then calls `onPasswordReset({ user })`, **then** deletes all sessions if `revokeSessionsOnPasswordReset` is set. Unknown or consumed token → `INVALID_TOKEN`.
  - `sendResetPassword` goes through `runInBackgroundOrAwait`. With no `advanced.backgroundTasks` configured, Better Auth **awaits** the callback.
- Rate limiting is built in. `/request-password-reset` has a special rule of 3 requests per 60s per IP. It is enabled only in production, with in-memory storage.
- The project has no email code or dependency. Local services come from `docker-compose.yml` (Postgres only).
- `app/login/page.tsx` and `app/register/page.tsx` are client components that validate with zod (`lib/validation/auth.ts`), call `authClient.*`, and render inside `AuthShell`.

## Goals / Non-Goals

**Goals:**
- Send email through plain SMTP so any provider works by changing environment variables, and so Mailpit catches everything in development.
- Keep the reset request free of observable differences between registered and unregistered emails, including response time.
- Make sure that a failed email never blocks a reset or leaves sessions alive.

**Non-Goals:**
- Background job queue or retries for email.
- Shared rate-limit storage (Redis/database) for multi-instance deploys.
- Email templating libraries (react-email, MJML).

## Decisions

### 1. Email module: `lib/email/`

- `lib/email/transport.ts`: a lazily created, module-level nodemailer transport built from `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` (auth only when a user is set), with `secure` when the port is 465. It exports `sendEmail({ to, subject, html, text })`, which uses `SMTP_FROM` as the sender. If `SMTP_HOST` or `SMTP_FROM` is missing, `sendEmail` throws a clear configuration error. The callers below catch and log it.
- `lib/email/templates.ts`: pure functions `passwordResetEmail({ name, url })` and `passwordResetNoticeEmail({ name })`, each returning `{ subject, html, text }` in pt-BR. They use minimal inline-styled HTML and escape the user's name.

Alternative considered: one generic `sendEmail` with the templates inside `lib/auth/server.ts`. Rejected because keeping templates as pure functions makes them easy to check without SMTP, and the transport stays reusable.

### 2. Fire-and-forget sends from the auth callbacks

Both callbacks start the send and return immediately: `void sendEmail(...).catch((error) => console.error(...))`.
- `sendResetPassword`: awaiting an SMTP round trip only for registered emails would make their response measurably slower, which reveals that the email is registered. A rejected send would also surface as an error only for registered emails. Not awaiting removes both signals.
- `onPasswordReset`: Better Auth calls it **before** revoking sessions. If it threw, the password would be changed but the sessions would stay alive, which breaks the spec. Not awaiting and catching keeps the reset and the session revocation independent of email delivery.

Alternative considered: `advanced.backgroundTasks.handler`. It needs a platform `waitUntil` (Vercel) and also affects other Better Auth background work. Rejected: the explicit `void ... .catch` in our two callbacks is narrower and runs on the long-lived `next start` server this project uses.

Trade-off: on serverless platforms an unawaited promise may be cut off after the response. Noted under Risks.

### 3. Auth config

In `lib/auth/server.ts`, under `emailAndPassword`:
- `sendResetPassword: async ({ user, url }) => { void sendEmail({ to: user.email, ...passwordResetEmail({ name: user.name, url }) }).catch(log) }`
- `onPasswordReset: async ({ user }) => { void sendEmail({ to: user.email, ...passwordResetNoticeEmail({ name: user.name }) }).catch(log) }`
- `revokeSessionsOnPasswordReset: true`
- `resetPasswordTokenExpiresIn` is left at the default (3600s), which matches the spec.

### 4. Pages and flow

```
/login --"Esqueci minha senha"--> /forgot-password
   authClient.requestPasswordReset({ email, redirectTo: "/reset-password" })
   -> neutral message (same for any email)

email link -> /api/auth/reset-password/<token>?callbackURL=/reset-password
   valid   -> /reset-password?token=<token>
   invalid -> /reset-password?error=INVALID_TOKEN

/reset-password
   authClient.resetPassword({ newPassword, token })
   ok            -> router.push("/login?reset=success")
   INVALID_TOKEN -> show the invalid-link state
```

- `app/forgot-password/page.tsx`: client component in `AuthShell`, following the login page pattern. After a successful call it replaces the form with the neutral message ("Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.") and a link back to login. A 429 from the rate limiter shows "Muitas tentativas. Aguarde um minuto e tente novamente."
- `app/reset-password/page.tsx`: Server Component that awaits `searchParams` (Next 16: a Promise; confirm in `node_modules/next/dist/docs/` before coding). It renders `AuthShell` with either the invalid-link state (no token, or `error` present) or the client `ResetPasswordForm` (`components/auth/reset-password-form.tsx`) with the token as a prop. Reading the query on the server avoids `useSearchParams` and its Suspense requirement.
- The invalid-link state is shared: the page uses it for `?error=` and for a missing token, and the form switches to it when the POST returns `INVALID_TOKEN` (the link was used or expired while the form was open). It shows "Este link é inválido ou expirou." and a button to `/forgot-password`.
- `app/login/page.tsx`: add a "Esqueci minha senha" link next to the password label, and a success notice when `?reset=success` is present. The login page is a client component, so the notice is a tiny client component using `useSearchParams`, wrapped in `<Suspense>` so `/login` stays statically prerendered.

### 5. Validation

In `lib/validation/auth.ts`:
- `forgotPasswordSchema`: `email` with the same message as login.
- `resetPasswordSchema`: `newPassword` (min 8, registration message) plus `confirmPassword` (required), refined to match on `confirmPassword`. This duplicates part of `changePasswordSchema` but without the current password. Each schema stays explicit rather than composed, so error paths stay obvious.

### 6. Local email with Mailpit

`docker-compose.yml` gets a `mailpit` service (`axllent/mailpit`, ports `1025` SMTP and `8025` web UI, `restart: unless-stopped`). `.env.example` documents the variables with Mailpit defaults: `SMTP_HOST="localhost"`, `SMTP_PORT="1025"`, empty `SMTP_USER`/`SMTP_PASSWORD`, and `SMTP_FROM="TWJobs AI <no-reply@twjobs.local>"`. A comment explains that emails can be read at `http://localhost:8025`.

## Risks / Trade-offs

- [Unawaited sends can be dropped on serverless runtimes] → The project runs `next start`, where the process outlives the response. If it moves to a serverless host, switch to `advanced.backgroundTasks.handler` with `waitUntil`.
- [A misconfigured SMTP fails silently for the user] → The visitor always sees the neutral message, by design. Failures are logged with `console.error`, including the configuration error when the `SMTP_*` variables are missing. The task list verifies delivery through Mailpit.
- [In-memory rate limit, production only] → Fine for one instance. Several instances would each count separately. Better Auth's `rateLimit.storage: "database"` is the follow-up if that happens.
- [The reset link carries the token in the URL] → This is standard for reset links. The token is single use, expires in 1h, and the GET callback moves it only into our own `/reset-password` query string.
- [The visitor is not signed in after the reset] → One extra step, chosen on purpose: all sessions are revoked, so signing in again with the new password confirms it works.

## Migration Plan

No database migration. Deploying needs `SMTP_*` variables set to a real provider. Without them, reset emails are logged as failures and nothing else breaks. For local development, run `docker compose up -d` again to start Mailpit.
