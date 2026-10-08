# Tasks

## 1. Validation

- [x] 1.1 Add `changePasswordSchema` (and `ChangePasswordInput` type) to `lib/validation/auth.ts` per the design: `currentPassword` required, `newPassword` min 8 with the registration message, `confirmPassword` required, refines for "confirmation matches" (path `confirmPassword`) and "differs from current" (path `newPassword`) — verify `npx tsc --noEmit` passes and a quick `safeParse` in `node`/`tsx` returns the expected field paths for a mismatched confirmation and for new == current

## 2. Change-password form and account page

- [x] 2.1 Add the client component `components/account/change-password-form.tsx`: three password inputs (`autoComplete` `current-password` / `new-password` / `new-password`), field errors from `changePasswordSchema` mapped like `app/register/page.tsx`, submit calling `authClient.changePassword({ currentPassword, newPassword, revokeOtherSessions: true })`, `INVALID_PASSWORD` → "Senha atual incorreta." on the current-password field, other errors → form error, success → reset fields and show the success message; button disabled with "Alterando..." while submitting — verify `npx tsc --noEmit` passes
- [x] 2.2 Add `app/(app)/account/page.tsx` (Server Component, `requireSession()`, `PageHeader` "Minha conta", `Card` with `SectionTitle` `KeyRound` "Alterar senha" wrapping the form), checking `node_modules/next/dist/docs/` for any page convention changes first — verify signed out `/account` redirects to `/login`, and signed in it renders inside the app shell

## 3. Account menu entry

- [x] 3.1 Add a "Minha conta" item (icon `KeyRound` or `Settings`) linking to `/account` in `components/layout/user-menu.tsx`, between "Meu perfil" and "Sair", closing the mobile sidebar on click — verify on desktop and at 390px that the item opens `/account` and the mobile sheet closes

## 4. Integration checks

- [x] 4.1 Run `npm run lint` and `npm run build` — verify both succeed
- [x] 4.2 Walk the `user-auth` validation scenarios on `/account` — verify: empty fields, a new password under 8 characters, a mismatched confirmation, and new == current each show the right field error and send no request; a wrong current password shows "Senha atual incorreta." and the old password still signs in
- [x] 4.3 Walk the success and session scenarios with two browsers (or a normal and a private window) signed in to the same account — verify: changing the password in window A shows the success message, clears the form, and keeps A signed in across navigation to `/dashboard`; window B is redirected to `/login` on its next navigation; signing in with the old password fails with the generic error and with the new password succeeds
