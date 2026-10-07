import Link from "next/link";
import { ChevronRight, MessagesSquare, Plus } from "lucide-react";

import { requireSession } from "@/lib/auth/session";
import { listInterviews } from "@/lib/db/repositories/interviews";
import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScoreBadge } from "@/components/ui/score-badge";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
});

export default async function InterviewsPage() {
  const session = await requireSession();
  const interviews = await listInterviews(session.user.id);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Minhas entrevistas"
        description="Simulados com o entrevistador de IA e suas análises."
        actions={
          <Link href="/interviews/new" className={buttonVariants({ variant: "cta" })}>
            <Plus data-icon="inline-start" />
            Nova entrevista
          </Link>
        }
      />

      {interviews.length === 0 ? (
        <EmptyState
          icon={MessagesSquare}
          title="Nenhuma entrevista ainda"
          description="Escolha um currículo gerado e treine com um entrevistador de IA."
          action={
            <Link href="/interviews/new" className={buttonVariants({ variant: "cta" })}>
              Iniciar primeira entrevista
            </Link>
          }
        />
      ) : (
        <ul className="grid gap-3">
          {interviews.map((interview) => {
            const posting = interview.resume.jobPosting;
            const completed = interview.status === "COMPLETED";
            return (
              <li key={interview.id}>
                <Link href={`/interviews/${interview.id}`} className="group block">
                  <Card className="transition-colors group-hover:border-primary/40 group-hover:bg-surface-elevated">
                    <CardContent className="flex items-center gap-4">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                        <MessagesSquare className="size-5" />
                      </span>
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <p className="truncate font-semibold text-foreground">
                          {posting.title}
                        </p>
                        <p className="truncate text-sm text-muted-foreground">
                          {posting.company ?? "Empresa não informada"} ·{" "}
                          {dateFormatter.format(interview.createdAt)}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1.5 sm:flex-row sm:items-center">
                        {completed ? (
                          <Badge variant="secondary">Concluída</Badge>
                        ) : (
                          <Badge variant="outline" className="border-cta/45 text-cta">
                            <span className="size-1.5 rounded-full bg-cta" />
                            Em andamento
                          </Badge>
                        )}
                        {interview.analysis && (
                          <ScoreBadge score={interview.analysis.overallScore} />
                        )}
                      </div>
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </CardContent>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
