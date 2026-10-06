import Link from "next/link";

import { requireSession } from "@/lib/auth/session";
import { listJobPostings } from "@/lib/db/repositories/job-postings";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
});

export default async function JobPostingsPage() {
  const session = await requireSession();
  const jobPostings = await listJobPostings(session.user.id);

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 p-6 dark:bg-black">
      <div className="flex w-full max-w-2xl flex-col gap-6 py-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
            Minhas vagas
          </h1>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-zinc-600 hover:underline dark:text-zinc-400"
            >
              Voltar ao painel
            </Link>
            <Link href="/jobs/new" className={buttonVariants()}>
              Nova vaga
            </Link>
          </div>
        </div>

        {jobPostings.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-6 text-center">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Você ainda não salvou nenhuma vaga. Cole o texto de um anúncio
                e deixe a IA organizar os dados para você.
              </p>
              <Link href="/jobs/new" className={buttonVariants()}>
                Adicionar primeira vaga
              </Link>
            </CardContent>
          </Card>
        ) : (
          <ul className="flex flex-col gap-3">
            {jobPostings.map((jobPosting) => (
              <li key={jobPosting.id}>
                <Card>
                  <CardContent className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-black dark:text-zinc-50">
                        {jobPosting.title}
                      </p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        {jobPosting.company ?? "Empresa não informada"}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <p className="text-sm text-zinc-500">
                        Salva em {dateFormatter.format(jobPosting.createdAt)}
                      </p>
                      <Link
                        href={`/resumes/new?jobPostingId=${jobPosting.id}`}
                        className={buttonVariants({ variant: "outline", size: "sm" })}
                      >
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
    </div>
  );
}
