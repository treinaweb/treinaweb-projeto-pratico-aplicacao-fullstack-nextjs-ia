"use client";

import { useState, type FormEvent } from "react";

import { authClient } from "@/lib/auth/client";
import { changePasswordSchema } from "@/lib/validation/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Called from the browser, not a Server Action: revoking the other sessions
// rotates the current session cookie, and only the browser receives it here
// (the auth config has no nextCookies() plugin).
export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setSuccess(false);

    const result = changePasswordSchema.safeParse({
      currentPassword,
      newPassword,
      confirmPassword,
    });
    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !errors[key]) {
          errors[key] = issue.message;
        }
      }
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    await authClient.changePassword(
      {
        currentPassword: result.data.currentPassword,
        newPassword: result.data.newPassword,
        revokeOtherSessions: true,
      },
      {
        onSuccess: () => {
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
          setSuccess(true);
          setIsSubmitting(false);
        },
        onError: (ctx) => {
          if (ctx.error.code === "INVALID_PASSWORD") {
            setFieldErrors({ currentPassword: "Senha atual incorreta." });
          } else if (ctx.error.code === "PASSWORD_TOO_SHORT") {
            setFieldErrors({
              newPassword: "A senha deve ter pelo menos 8 caracteres.",
            });
          } else {
            setFormError("Não foi possível alterar sua senha. Tente novamente.");
          }
          setIsSubmitting(false);
        },
      },
    );
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="currentPassword">Senha atual</Label>
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
        />
        {fieldErrors.currentPassword && (
          <p className="text-sm text-destructive">
            {fieldErrors.currentPassword}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="newPassword">Nova senha</Label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
        />
        {fieldErrors.newPassword && (
          <p className="text-sm text-destructive">{fieldErrors.newPassword}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
        />
        {fieldErrors.confirmPassword && (
          <p className="text-sm text-destructive">
            {fieldErrors.confirmPassword}
          </p>
        )}
      </div>

      {formError && <p className="text-sm text-destructive">{formError}</p>}
      {success && (
        <p role="status" className="text-sm text-cta">
          Senha alterada com sucesso. Outras sessões foram encerradas.
        </p>
      )}

      <div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Alterando..." : "Alterar senha"}
        </Button>
      </div>
    </form>
  );
}
