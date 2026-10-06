import Link from "next/link";

import { requireSession } from "@/lib/auth/session";
import { listInterviews } from "@/lib/db/repositories/interviews";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
});

export default async function InterviewsPage() {
  const session = await requireSession();
  const interviews = await listInterviews(session.user.id);

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 p-6 dark:bg-black">
      <div className="flex w-full max-w-2xl flex-col gap-6 py-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
            Minhas entrevistas
          </h1>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-zinc-600 hover:underline dark:text-zinc-400"
            >
              Voltar ao painel
            </Link>
            <Link href="/interviews/new" className={buttonVariants()}>
              Nova entrevista
            </Link>
          </div>
        </div>

        {interviews.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-6 text-center">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Você ainda não fez nenhuma entrevista simulada. Escolha um
                currículo gerado e treine com um entrevistador de IA.
              </p>
              <Link href="/interviews/new" className={buttonVariants()}>
                Iniciar primeira entrevista
              </Link>
            </CardContent>
          </Card>
        ) : (
          <ul className="flex flex-col gap-3">
            {interviews.map((interview) => {
              const posting = interview.resume.jobPosting;
              const completed = interview.status === "COMPLETED";
              return (
                <li key={interview.id}>
                  <Link href={`/interviews/${interview.id}`} className="block">
                    <Card className="transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900">
                      <CardContent className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium text-black dark:text-zinc-50">
                            {posting.title}
                          </p>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            {posting.company ?? "Empresa não informada"}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          <span
                            className={
                              completed
                                ? "rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                                : "rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            }
                          >
                            {completed ? "Concluída" : "Em andamento"}
                          </span>
                          {interview.analysis && (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              Nota {interview.analysis.overallScore}
                            </span>
                          )}
                          <p className="text-sm text-zinc-500">
                            {dateFormatter.format(interview.createdAt)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
