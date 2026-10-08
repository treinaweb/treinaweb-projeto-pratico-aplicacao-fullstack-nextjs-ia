import type { Email } from "@/lib/email/transport";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function layout(body: string) {
  return `<!doctype html>
<html lang="pt-BR">
  <body style="margin:0;padding:24px;background:#f4f5f9;font-family:Arial,Helvetica,sans-serif;color:#1f2333;">
    <div style="max-width:520px;margin:0 auto;padding:32px;background:#ffffff;border-radius:12px;">
      <p style="margin:0 0 24px;font-weight:bold;color:#7077ff;">TWJobs AI</p>
      ${body}
    </div>
  </body>
</html>`;
}

export function passwordResetEmail({
  name,
  url,
}: {
  name: string;
  url: string;
}): Email {
  const safeName = escapeHtml(name);
  const safeUrl = escapeHtml(url);

  return {
    subject: "Redefina sua senha do TWJobs AI",
    html: layout(`
      <p style="margin:0 0 16px;">Olá, ${safeName}!</p>
      <p style="margin:0 0 24px;">Recebemos um pedido para redefinir a senha da sua conta. Clique no botão abaixo para escolher uma nova senha. O link vale por 1 hora e só pode ser usado uma vez.</p>
      <p style="margin:0 0 24px;">
        <a href="${safeUrl}" style="display:inline-block;padding:12px 24px;background:#48d359;color:#0a0d18;font-weight:bold;text-decoration:none;border-radius:999px;">Redefinir senha</a>
      </p>
      <p style="margin:0 0 8px;font-size:13px;color:#5b6075;">Se o botão não funcionar, copie e cole este endereço no navegador:</p>
      <p style="margin:0 0 24px;font-size:13px;word-break:break-all;"><a href="${safeUrl}" style="color:#7077ff;">${safeUrl}</a></p>
      <p style="margin:0;font-size:13px;color:#5b6075;">Se você não pediu a redefinição, ignore este e-mail: sua senha continua a mesma.</p>
    `),
    text: `Olá, ${name}!

Recebemos um pedido para redefinir a senha da sua conta no TWJobs AI.
Acesse o link abaixo para escolher uma nova senha. Ele vale por 1 hora e só pode ser usado uma vez.

${url}

Se você não pediu a redefinição, ignore este e-mail: sua senha continua a mesma.`,
  };
}

export function passwordResetNoticeEmail({ name }: { name: string }): Email {
  const safeName = escapeHtml(name);

  return {
    subject: "Sua senha do TWJobs AI foi alterada",
    html: layout(`
      <p style="margin:0 0 16px;">Olá, ${safeName}!</p>
      <p style="margin:0 0 16px;">A senha da sua conta foi redefinida agora há pouco, e todas as sessões abertas foram encerradas.</p>
      <p style="margin:0;font-size:13px;color:#5b6075;">Se não foi você, peça uma nova redefinição de senha na tela de login o quanto antes.</p>
    `),
    text: `Olá, ${name}!

A senha da sua conta no TWJobs AI foi redefinida agora há pouco, e todas as sessões abertas foram encerradas.

Se não foi você, peça uma nova redefinição de senha na tela de login o quanto antes.`,
  };
}
