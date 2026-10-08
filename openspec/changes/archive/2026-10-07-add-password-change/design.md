# Design

## Context

- Auth is Better Auth with `emailAndPassword` enabled (`lib/auth/server.ts`), mounted at `app/api/auth/[...all]/route.ts`. The `POST /change-password` endpoint already exists: it requires a session, verifies `currentPassword`, enforces the configured minimum length (default 8, the same as `registerSchema`), and accepts `revokeOtherSessions`.
- Register and login are client components that validate with zod schemas from `lib/validation/auth.ts` and then call `authClient.*` (`lib/auth/client.ts`). Profile forms instead use Server Actions with `useActionState`.
- The auth config does **not** use the `nextCookies()` plugin, so Better Auth calls made from a Server Action cannot set cookies on the response.
- `cookieCache` is not enabled, so every `getSession` reads the session table; a deleted session stops working on its next request.
- Signed-in pages live under `app/(app)/`; each page calls `requireSession()` itself (the layout is not the guard).

## Goals / Non-Goals

**Goals:**
- Change the password through Better Auth's built-in endpoint, with no schema or migration changes.
- Keep the current device signed in while ending all other sessions.
- Show field-level errors that match the existing auth forms.

**Non-Goals:**
- Changing the auth configuration (plugins, password policy, cookie cache).
- Server-side enforcement of "new password differs from current" (see Risks).

## Decisions

### Call `authClient.changePassword` from a client form, not a Server Action

With `revokeOtherSessions: true`, Better Auth deletes the user's sessions and issues a **new** session cookie for the caller. From the browser, that `Set-Cookie` lands naturally. From a Server Action without `nextCookies()`, the new cookie would be lost and the candidate would be signed out right after changing their password, which the spec forbids.

Alternative considered: add `nextCookies()` to `lib/auth/server.ts` and use a Server Action with `useActionState` like the profile forms. Rejected for now: it changes global auth behavior to support one form. The client approach also matches `app/register/page.tsx` and `app/login/page.tsx`, the closest existing code.

### Shared zod schema for client validation

Add `changePasswordSchema` to `lib/validation/auth.ts` with `currentPassword` (min 1, "Informe sua senha atual."), `newPassword` (min 8, same message as registration), and `confirmPassword` (min 1). Two `.refine`s, each with a `path` so errors map to a field:
- `confirmPassword === newPassword` → "As senhas não coincidem." on `confirmPassword`.
- `newPassword !== currentPassword` → "A nova senha deve ser diferente da atual." on `newPassword`.

The form maps issues to `fieldErrors` the same way the register page does (first issue per `path[0]`).

### Map server errors

`onError` from `authClient.changePassword`:
- `ctx.error.code === "INVALID_PASSWORD"` → field error on `currentPassword`: "Senha atual incorreta."
- `PASSWORD_TOO_SHORT` (only if client validation is bypassed) → field error on `newPassword`.
- anything else → form error "Não foi possível alterar sua senha. Tente novamente."

On success: reset the three fields, clear errors, and show an inline success message ("Senha alterada com sucesso. Outras sessões foram encerradas."). No redirect; the page stays the same.

### Page and navigation

- `app/(app)/account/page.tsx`: Server Component that calls `requireSession()`, renders `PageHeader` ("Minha conta") and a `Card` with the `ChangePasswordForm` client component (`components/account/change-password-form.tsx`), styled like the profile cards (`SectionTitle` with a `KeyRound` icon, "Alterar senha").
- Inputs use `type="password"` with `autoComplete="current-password"` / `"new-password"` so password managers behave correctly.
- `components/layout/user-menu.tsx`: add a "Minha conta" `DropdownMenuItem` linking to `/account` (closes the mobile sidebar like "Meu perfil"), placed between "Meu perfil" and "Sair". The sidebar nav sections stay unchanged, as account settings are not a "Preparação" area.

## Risks / Trade-offs

- [The "new differs from current" rule only runs on the client] → A direct API call could set the same password again. That harms nobody (the candidate already knows that password), so client-side enforcement is enough.
- [Session rotation on success] → The current session token is replaced. The browser receives the new cookie from the same response, so later navigation keeps working. Verify by hand that the next protected page loads without a redirect to `/login`.
- [Other devices keep showing a page they already loaded] → They are redirected to `/login` on their next server request, because `cookieCache` is off. Acceptable.
