"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

import { authClient } from "@/lib/auth/client";
import { forgotPasswordSchema } from "@/lib/validation/auth";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const result = forgotPasswordSchema.safeParse({ email });
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

    // The answer is the same whether or not the email is registered.
    await authClient.requestPasswordReset(
      { email: result.data.email, redirectTo: "/reset-password" },
      {
        onSuccess: () => {
          setSent(true);
        },
        onError: (ctx) => {
          setFormError(
            ctx.response.status === 429
              ? "Muitas tentativas. Aguarde um minuto e tente novamente."
              : "Não foi possível enviar o link. Tente novamente.",
          );
          setIsSubmitting(false);
        },
      },
    );
  };

  return (
    <AuthShell
      title="Esqueci minha senha"
      description="Informe o e-mail da sua conta e enviaremos um link para redefinir a senha."
    >
      <div>
        {sent ? (
          <p role="status" className="text-sm text-body">
            Se o e-mail estiver cadastrado, você receberá um link para
            redefinir sua senha. Confira também a caixa de spam.
          </p>
        ) : (
          <form
            className="flex flex-col gap-4"
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              {fieldErrors.email && (
                <p className="text-sm text-destructive">{fieldErrors.email}</p>
              )}
            </div>

            {formError && (
              <p className="text-sm text-destructive">{formError}</p>
            )}

            <Button
              type="submit"
              variant="cta"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Enviando..." : "Enviar link"}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Lembrou a senha?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            Voltar para o login
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
