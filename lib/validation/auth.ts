import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Informe seu nome."),
  email: z.email("Informe um e-mail válido."),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres."),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.email("Informe um e-mail válido."),
  password: z.string().min(1, "Informe sua senha."),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Informe sua senha atual."),
    newPassword: z.string().min(8, "A senha deve ter pelo menos 8 caracteres."),
    confirmPassword: z.string().min(1, "Confirme a nova senha."),
  })
  .refine((data) => data.confirmPassword === data.newPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "A nova senha deve ser diferente da atual.",
    path: ["newPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const forgotPasswordSchema = z.object({
  email: z.email("Informe um e-mail válido."),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(8, "A senha deve ter pelo menos 8 caracteres."),
    confirmPassword: z.string().min(1, "Confirme a nova senha."),
  })
  .refine((data) => data.confirmPassword === data.newPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
