import nodemailer, { type Transporter } from "nodemailer";

// The only module that talks SMTP. In development the SMTP_* variables point
// to Mailpit (docker-compose.yml); in production, to any SMTP provider.
let transporter: Transporter | undefined;

function getTransporter() {
  const host = process.env.SMTP_HOST;
  if (!host) {
    throw new Error("SMTP_HOST is not set");
  }

  if (!transporter) {
    const port = Number(process.env.SMTP_PORT ?? 587);
    const user = process.env.SMTP_USER;

    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: user ? { user, pass: process.env.SMTP_PASSWORD } : undefined,
    });
  }

  return transporter;
}

export type Email = {
  subject: string;
  html: string;
  text: string;
};

export async function sendEmail({ to, ...email }: Email & { to: string }) {
  const from = process.env.SMTP_FROM;
  if (!from) {
    throw new Error("SMTP_FROM is not set");
  }

  await getTransporter().sendMail({ from, to, ...email });
}
