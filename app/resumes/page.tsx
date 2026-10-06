import Link from "next/link";

import { requireSession } from "@/lib/auth/session";
import { listResumes } from "@/lib/db/repositories/resumes";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
});

export default async function ResumesPage() {
  const session = await requireSession();
  const resumes = await listResumes(session.user.id);

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 p-6 dark:bg-black">
      <div className="flex w-full max-w-2xl flex-col gap-6 py-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
            Meus currículos
          </h1>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-zinc-600 hover:underline dark:text-zinc-400"
            >
              Voltar ao painel
            </Link>
            <Link href="/resumes/new" className={buttonVariants()}>
              Gerar currículo
            </Link>
          </div>
        </div>

        {resumes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-6 text-center">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Você ainda não gerou nenhum currículo. Escolha uma vaga salva e
                deixe a IA adaptar seu perfil para ela.
              </p>
              <Link href="/resumes/new" className={buttonVariants()}>
                Gerar primeiro currículo
              </Link>
            </CardContent>
          </Card>
        ) : (
          <ul className="flex flex-col gap-3">
            {resumes.map((resume) => (
              <li key={resume.id}>
                <Link href={`/resumes/${resume.id}`} className="block">
                  <Card className="transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900">
                    <CardContent className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-black dark:text-zinc-50">
                          {resume.jobPosting.title}
                        </p>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                          {resume.jobPosting.company ?? "Empresa não informada"}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm text-zinc-500">
                        Gerado em {dateFormatter.format(resume.createdAt)}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
