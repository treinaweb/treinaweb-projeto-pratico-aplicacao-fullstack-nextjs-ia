import Link from "next/link";

import { requireSession } from "@/lib/auth/session";
import { getFullProfile } from "@/lib/db/repositories/candidate-profile";
import { listJobPostings } from "@/lib/db/repositories/job-postings";
import { profileHasResumeContent } from "@/lib/resume/assemble";
import { GenerateResumeForm } from "@/components/resumes/generate-resume-form";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function NewResumePage({
  searchParams,
}: PageProps<"/resumes/new">) {
  const session = await requireSession();
  const userId = session.user.id;
  const { jobPostingId } = await searchParams;

  const [jobPostings, profile] = await Promise.all([
    listJobPostings(userId),
    getFullProfile(userId),
  ]);

  const selectedId = jobPostings.some((posting) => posting.id === jobPostingId)
    ? (jobPostingId as string)
    : undefined;

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 p-6 dark:bg-black">
      <div className="flex w-full max-w-2xl flex-col gap-6 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
            Novo currículo
          </h1>
          <Link
            href="/resumes"
            className="text-sm font-medium text-zinc-600 hover:underline dark:text-zinc-400"
          >
            Voltar aos currículos
          </Link>
        </div>

        {jobPostings.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-6 text-center">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Para gerar um currículo, salve primeiro a vaga para a qual você
                quer se candidatar.
              </p>
              <Link href="/jobs/new" className={buttonVariants()}>
                Adicionar vaga
              </Link>
            </CardContent>
          </Card>
        ) : !profileHasResumeContent(profile) ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-6 text-center">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Seu perfil ainda não tem experiências, formações, projetos ou
                habilidades. Preencha seu perfil antes de gerar um currículo.
              </p>
              <Link href="/profile" className={buttonVariants()}>
                Ir para o perfil
              </Link>
            </CardContent>
          </Card>
        ) : (
          <GenerateResumeForm
            jobPostings={jobPostings}
            selectedId={selectedId}
          />
        )}
      </div>
    </div>
  );
}
