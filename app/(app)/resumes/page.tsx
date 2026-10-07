import Link from "next/link";
import { ChevronRight, FileText, Plus } from "lucide-react";

import { requireSession } from "@/lib/auth/session";
import { listResumes } from "@/lib/db/repositories/resumes";
import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
});

const LANGUAGE_LABELS: Record<string, string> = {
  "pt-BR": "Português",
  en: "Inglês",
};

export default async function ResumesPage() {
  const session = await requireSession();
  const resumes = await listResumes(session.user.id);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Meus currículos"
        description="Currículos gerados pela IA, cada um sob medida para uma vaga."
        actions={
          <Link href="/resumes/new" className={buttonVariants({ variant: "cta" })}>
            <Plus data-icon="inline-start" />
            Gerar currículo
          </Link>
        }
      />

      {resumes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Nenhum currículo gerado"
          description="Escolha uma vaga salva e deixe a IA adaptar seu perfil para ela."
          action={
            <Link href="/resumes/new" className={buttonVariants({ variant: "cta" })}>
              Gerar primeiro currículo
            </Link>
          }
        />
      ) : (
        <ul className="grid gap-3">
          {resumes.map((resume) => (
            <li key={resume.id}>
              <Link href={`/resumes/${resume.id}`} className="group block">
                <Card className="transition-colors group-hover:border-primary/40 group-hover:bg-surface-elevated">
                  <CardContent className="flex items-center gap-4">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                      <FileText className="size-5" />
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <p className="truncate font-semibold text-foreground">
                        {resume.jobPosting.title}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">
                        {resume.jobPosting.company ?? "Empresa não informada"}
                      </p>
                    </div>
                    <div className="hidden shrink-0 flex-col items-end gap-1.5 sm:flex">
                      <Badge variant="secondary">
                        {LANGUAGE_LABELS[resume.language] ?? resume.language}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        Gerado em {dateFormatter.format(resume.createdAt)}
                      </p>
                    </div>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
