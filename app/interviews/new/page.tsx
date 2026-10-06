import Link from "next/link";

import { requireSession } from "@/lib/auth/session";
import { listResumes } from "@/lib/db/repositories/resumes";
import { StartInterviewForm } from "@/components/interviews/start-interview-form";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
});

export default async function NewInterviewPage({
  searchParams,
}: PageProps<"/interviews/new">) {
  const session = await requireSession();
  const { resumeId } = await searchParams;

  const resumes = await listResumes(session.user.id);
  const options = resumes.map((resume) => ({
    id: resume.id,
    label: [
      resume.jobPosting.title,
      resume.jobPosting.company,
      dateFormatter.format(resume.createdAt),
    ]
      .filter(Boolean)
      .join(" · "),
  }));
  const selectedId = resumes.some((resume) => resume.id === resumeId)
    ? (resumeId as string)
    : undefined;

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 p-6 dark:bg-black">
      <div className="flex w-full max-w-2xl flex-col gap-6 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
            Nova entrevista
          </h1>
          <Link
            href="/interviews"
            className="text-sm font-medium text-zinc-600 hover:underline dark:text-zinc-400"
          >
            Voltar às entrevistas
          </Link>
        </div>

        {options.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-6 text-center">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                A entrevista simulada usa um currículo gerado para a vaga. Gere
                um currículo primeiro.
              </p>
              <Link href="/resumes/new" className={buttonVariants()}>
                Gerar currículo
              </Link>
            </CardContent>
          </Card>
        ) : (
          <StartInterviewForm resumes={options} selectedId={selectedId} />
        )}
      </div>
    </div>
  );
}
