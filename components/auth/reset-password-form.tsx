"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth/client";
import { resetPasswordSchema } from "@/lib/validation/auth";
import { InvalidResetLink } from "@/components/auth/invalid-reset-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [linkInvalid, setLinkInvalid] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const result = resetPasswordSchema.safeParse({
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

    await authClient.resetPassword(
      { newPassword: result.data.newPassword, token },
      {
        onSuccess: () => {
          router.push("/login?reset=success");
        },
        onError: (ctx) => {
          if (ctx.error.code === "INVALID_TOKEN") {
            // Expired or used in another tab while this form was open.
            setLinkInvalid(true);
          } else if (ctx.error.code === "PASSWORD_TOO_SHORT") {
            setFieldErrors({
              newPassword: "A senha deve ter pelo menos 8 caracteres.",
            });
          } else {
            setFormError(
              "Não foi possível redefinir sua senha. Tente novamente.",
            );
          }
          setIsSubmitting(false);
        },
      },
    );
  };

  if (linkInvalid) {
    return <InvalidResetLink />;
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
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

      <Button type="submit" variant="cta" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Redefinindo..." : "Redefinir senha"}
      </Button>
    </form>
  );
}
