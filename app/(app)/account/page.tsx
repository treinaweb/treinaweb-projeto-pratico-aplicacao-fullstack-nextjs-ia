import { KeyRound } from "lucide-react";

import { requireSession } from "@/lib/auth/session";

import { ChangePasswordForm } from "@/components/account/change-password-form";
import { PageHeader } from "@/components/layout/page-header";
import { SectionTitle } from "@/components/profile/section-title";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default async function AccountPage() {
  await requireSession();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <PageHeader
        title="Minha conta"
        description="Gerencie o acesso à sua conta."
      />

      <Card>
        <CardHeader>
          <SectionTitle icon={KeyRound} title="Alterar senha" />
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
