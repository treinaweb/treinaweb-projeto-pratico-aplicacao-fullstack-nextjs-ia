# Proposal

## Why

A candidate who forgets their password has no way back into their account: the only password changes happen while signed in (`/account`). They lose access to their profile, resumes, and interview history, and the only workaround is a new account. A self-service reset by email is the standard way out, and the platform cannot send email at all today.

## What Changes

- Add outbound email: an SMTP sender configured by environment variables, with a Mailpit service in `docker-compose.yml` that catches every email locally (web UI on `localhost:8025`).
- Add a "Esqueci minha senha" link on the login page, leading to a page where the visitor enters their email. The answer is the same whether or not the email is registered.
- Send a reset email in Portuguese with a single-use link valid for 1 hour.
- Add a reset page reached from that link: new password plus confirmation, same rules as registration. An invalid, expired, or already used link shows an explanation and a way to request a new one.
- After a reset: end **every** session of the account, send a "sua senha foi alterada" notice email, and take the visitor to the login page with a success message. They are not signed in automatically.

Out of scope: a notice email for the signed-in password change at `/account`, email verification, API-based email providers, and a shared rate-limit store for multiple instances.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `user-auth`: adds requirements for requesting a password reset, resetting the password through the emailed link, handling invalid or expired links, ending all sessions after a reset, and notifying the account owner by email.

## Impact

- New dependency: `nodemailer` (+ `@types/nodemailer`).
- `docker-compose.yml`: new `mailpit` service. `.env.example`: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`.
- `lib/auth/server.ts`: `sendResetPassword`, `onPasswordReset`, `revokeSessionsOnPasswordReset`.
- New `lib/email/*` (transport and the two email templates).
- New public pages `app/forgot-password/page.tsx` and `app/reset-password/page.tsx`; `app/login/page.tsx` gets the link and the post-reset message.
- `lib/validation/auth.ts`: schemas for the two new forms.
- No database migration: reset tokens use the existing `verification` table.
