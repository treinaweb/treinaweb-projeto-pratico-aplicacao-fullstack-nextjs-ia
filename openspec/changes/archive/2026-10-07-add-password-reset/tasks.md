# Tasks

## 1. Email infrastructure

- [x] 1.1 Add the `mailpit` service (`axllent/mailpit`, ports 1025 and 8025, `restart: unless-stopped`) to `docker-compose.yml`, and document `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` with Mailpit defaults and a note about `http://localhost:8025` in `.env.example` — verify `docker compose up -d` starts Mailpit and `http://localhost:8025` answers
- [x] 1.2 Install `nodemailer` and `@types/nodemailer` — verify they appear in `package.json` and `npx tsc --noEmit` still passes
- [x] 1.3 Add `lib/email/transport.ts` (lazy nodemailer transport from `SMTP_*`, auth only with a user, `secure` on port 465, `sendEmail({ to, subject, html, text })` with `SMTP_FROM`, a clear error when `SMTP_HOST`/`SMTP_FROM` are missing) — verify a one-off script sending a test email shows up in Mailpit
- [x] 1.4 Add `lib/email/templates.ts` with `passwordResetEmail({ name, url })` and `passwordResetNoticeEmail({ name })` returning pt-BR `{ subject, html, text }` with the name HTML-escaped — verify `npx tsc --noEmit` passes and the reset template includes the URL in both the HTML and the text version

## 2. Auth configuration

- [x] 2.1 In `lib/auth/server.ts` add `sendResetPassword` and `onPasswordReset`, both sending without awaiting (`void sendEmail(...).catch(console.error)`), plus `revokeSessionsOnPasswordReset: true` — verify `POST /api/auth/request-password-reset` for a registered email puts a reset email with a link in Mailpit, and for an unknown email returns the same body with no email

## 3. Validation

- [x] 3.1 Add `forgotPasswordSchema` and `resetPasswordSchema` (new password min 8 with the registration message, confirmation must match on `confirmPassword`) to `lib/validation/auth.ts` — verify `npx tsc --noEmit` passes and `safeParse` puts errors on the expected fields for a malformed email, a short password, and a mismatched confirmation

## 4. Pages

- [x] 4.1 Add `app/forgot-password/page.tsx` (client, `AuthShell`, email field, `authClient.requestPasswordReset({ email, redirectTo: "/reset-password" })`, neutral message replacing the form on success, rate-limit message on 429, link back to login) — verify that a registered and an unknown email show the identical message, and a malformed email shows a field error without a request
- [x] 4.2 Add `app/reset-password/page.tsx` (Server Component awaiting `searchParams`, after checking `node_modules/next/dist/docs/` for the page props) and `components/auth/reset-password-form.tsx` (new password plus confirmation, `authClient.resetPassword({ newPassword, token })`, `INVALID_TOKEN` switches to the invalid-link state, success goes to `/login?reset=success`), with a shared invalid-link state linking to `/forgot-password` — verify `/reset-password` with no token and with `?error=INVALID_TOKEN` shows the invalid-link state, and a short or mismatched password shows field errors
- [x] 4.3 Update `app/login/page.tsx`: "Esqueci minha senha" link to `/forgot-password`, and a success notice for `?reset=success` in a small `useSearchParams` client component wrapped in `<Suspense>` — verify the link opens `/forgot-password`, `/login?reset=success` shows the notice, plain `/login` does not, and `npm run build` still lists `/login` as static

## 5. Integration checks

- [x] 5.1 Run `npm run lint` and `npm run build` — verify both succeed
- [x] 5.2 Walk the full reset with Mailpit and two sessions of the same account open — verify: request → email in Mailpit with a working link → new password set → redirect to `/login` with the notice; a "senha alterada" email arrives; the other session is redirected to `/login` on its next navigation; the old password fails and the new one works; opening the same link again shows the invalid-link state
- [x] 5.3 Check expiry and failure paths — verify: a token with `expiresAt` moved to the past in the `verification` table shows the invalid-link state; with Mailpit stopped (`docker compose stop mailpit`), the reset request still shows the neutral message and logs the send error, and a reset with a valid link still changes the password and ends sessions even though the notice fails to send
