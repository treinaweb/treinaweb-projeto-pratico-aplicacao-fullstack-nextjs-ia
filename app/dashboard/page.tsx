import Link from "next/link";

import { requireSession } from "@/lib/auth/session";
import { LogoutButton } from "@/components/auth/logout-button";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const session = await requireSession();

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 p-6 dark:bg-black">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Olá, {session.user.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {session.user.email}
          </p>
          <Link href="/profile" className={buttonVariants({ variant: "outline" })}>
            Meu perfil
          </Link>
          <LogoutButton />
        </CardContent>
      </Card>
    </div>
  );
}
