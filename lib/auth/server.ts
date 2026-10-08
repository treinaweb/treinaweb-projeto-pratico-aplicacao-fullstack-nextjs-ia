import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { prisma } from "@/lib/db/client";
import { sendEmail } from "@/lib/email/transport";
import {
  passwordResetEmail,
  passwordResetNoticeEmail,
} from "@/lib/email/templates";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    // Emails are sent without awaiting. For sendResetPassword, awaiting would
    // make registered emails answer slower than unknown ones. onPasswordReset
    // runs before sessions are revoked, so a failed notice must not throw.
    sendResetPassword: async ({ user, url }) => {
      void sendEmail({
        to: user.email,
        ...passwordResetEmail({ name: user.name, url }),
      }).catch((error) => {
        console.error("Failed to send password reset email:", error);
      });
    },
    onPasswordReset: async ({ user }) => {
      void sendEmail({
        to: user.email,
        ...passwordResetNoticeEmail({ name: user.name }),
      }).catch((error) => {
        console.error("Failed to send password reset notice:", error);
      });
    },
    revokeSessionsOnPasswordReset: true,
  },
});
