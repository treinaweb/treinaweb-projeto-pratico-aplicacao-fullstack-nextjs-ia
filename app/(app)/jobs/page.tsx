import Link from "next/link";
import { BriefcaseBusiness, Building2, FileText, MapPin, Plus } from "lucide-react";

import { requireSession } from "@/lib/auth/session";
import { listJobPostings } from "@/lib/db/repositories/job-postings";
import { WORK_MODEL_LABELS } from "@/lib/jobs/labels";
import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
});

export default async function JobPostingsPage() {
  const session = await requireSession();
  const jobPostings = await listJobPostings(session.user.id);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Minhas vagas"
        description="Vagas salvas e organizadas pela IA a partir do anúncio."
        actions={
          <Link href="/jobs/new" className={buttonVariants({ variant: "cta" })}>
            <Plus data-icon="inline-start" />
            Nova vaga
          </Link>
        }
      />

      {jobPostings.length === 0 ? (
        <EmptyState
          icon={BriefcaseBusiness}
          title="Nenhuma vaga salva"
          description="Cole o texto de um anúncio e deixe a IA organizar os dados para você."
          action={
            <Link href="/jobs/new" className={buttonVariants({ variant: "cta" })}>
              Adicionar primeira vaga
            </Link>
          }
        />
      ) : (
        <ul className="grid gap-3">
          {jobPostings.map((jobPosting) => (
            <li key={jobPosting.id}>
              <Card className="transition-colors hover:border-primary/40">
                <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 flex-col gap-2">
                    <p className="font-semibold text-foreground">{jobPosting.title}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <Building2 className="size-3.5" />
                        {jobPosting.company ?? "Empresa não informada"}
                      </span>
                      {jobPosting.location && (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="size-3.5" />
                          {jobPosting.location}
                        </span>
                      )}
                    </div>
                    {(jobPosting.workModel || jobPosting.seniority) && (
                      <div className="flex flex-wrap gap-1.5">
                        {jobPosting.workModel && (
                          <Badge variant="secondary">
                            {WORK_MODEL_LABELS[jobPosting.workModel]}
                          </Badge>
                        )}
                        {jobPosting.seniority && (
                          <Badge variant="outline">{jobPosting.seniority}</Badge>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center justify-between gap-3 sm:flex-col sm:items-end">
                    <p className="text-xs text-muted-foreground">
                      Salva em {dateFormatter.format(jobPosting.createdAt)}
                    </p>
                    <Link
                      href={`/resumes/new?jobPostingId=${jobPosting.id}`}
                      className={buttonVariants({ variant: "outline", size: "sm" })}
                    >
                      <FileText data-icon="inline-start" />
                      Gerar currículo
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
