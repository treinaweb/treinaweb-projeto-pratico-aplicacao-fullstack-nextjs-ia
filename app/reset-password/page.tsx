import { AuthShell } from "@/components/auth/auth-shell";
import { InvalidResetLink } from "@/components/auth/invalid-reset-link";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

// Reached from the emailed link: Better Auth validates the token and redirects
// here with ?token=... or, when it is invalid or expired, ?error=INVALID_TOKEN.
export default async function ResetPasswordPage({
  searchParams,
}: PageProps<"/reset-password">) {
  const { token, error } = await searchParams;
  const validToken = typeof token === "string" && token && !error ? token : null;

  return (
    <AuthShell
      title="Redefinir senha"
      description="Escolha uma nova senha para sua conta."
    >
      {validToken ? (
        <ResetPasswordForm token={validToken} />
      ) : (
        <InvalidResetLink />
      )}
    </AuthShell>
  );
}
