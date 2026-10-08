# Proposal

## Why

A signed-in candidate has no way to change their password: the only password they ever set is the one typed at registration. If they suspect it leaked, reused it elsewhere, or simply want a stronger one, they are stuck. Changing the password while signed in is basic account hygiene and the natural next step after registration, login, and logout.

## What Changes

- Add an account page (`/account`, "Minha conta") inside the authenticated app shell with a "Alterar senha" form: current password, new password, and new password confirmation.
- Validate the form with the same rules as registration (new password at least 8 characters), plus: confirmation must match, and the new password must differ from the current one.
- Verify the current password before changing it; on a wrong current password, show a field error and keep the password unchanged.
- On success, keep the candidate signed in on the current device, end every other session of the account, clear the form, and show a success message.
- Add a "Minha conta" entry to the account menu in the app shell so the page is reachable from any signed-in page.

Out of scope: password reset for signed-out users ("forgot password"), email verification, changing name or email, and password strength meters.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `user-auth`: adds requirements for a signed-in candidate to change their password (current-password check, validation, other sessions ended).
- `app-shell`: the account menu also offers access to the account page, and the shell wraps the account page.

## Impact

- New route `app/(app)/account/page.tsx` and a client form component (e.g. `components/account/change-password-form.tsx`).
- `lib/validation/auth.ts`: new `changePasswordSchema`.
- `components/layout/user-menu.tsx`: new "Minha conta" item.
- Uses Better Auth's existing `changePassword` endpoint (already exposed by `app/api/auth/[...all]/route.ts` with `emailAndPassword` enabled); no new dependency, no database migration.
