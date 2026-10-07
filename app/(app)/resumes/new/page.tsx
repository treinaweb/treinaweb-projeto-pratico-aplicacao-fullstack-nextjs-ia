import Link from "next/link";
import { BriefcaseBusiness, UserRound } from "lucide-react";

import { requireSession } from "@/lib/auth/session";
import { getFullProfile } from "@/lib/db/repositories/candidate-profile";
import { listJobPostings } from "@/lib/db/repositories/job-postings";
import { profileHasResumeContent } from "@/lib/resume/assemble";
import { GenerateResumeForm } from "@/components/resumes/generate-resume-form";
import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";

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
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <PageHeader
        back={{ href: "/resumes", label: "Currículos" }}
        title="Novo currículo"
        description="A IA combina seu perfil com os requisitos da vaga escolhida."
      />

      {jobPostings.length === 0 ? (
        <EmptyState
          icon={BriefcaseBusiness}
          title="Nenhuma vaga salva"
          description="Para gerar um currículo, salve primeiro a vaga para a qual você quer se candidatar."
          action={
            <Link href="/jobs/new" className={buttonVariants({ variant: "cta" })}>
              Adicionar vaga
            </Link>
          }
        />
      ) : !profileHasResumeContent(profile) ? (
        <EmptyState
          icon={UserRound}
          title="Seu perfil ainda está vazio"
          description="Seu perfil ainda não tem experiências, formações, projetos ou habilidades. Preencha seu perfil antes de gerar um currículo."
          action={
            <Link href="/profile" className={buttonVariants({ variant: "cta" })}>
              Ir para o perfil
            </Link>
          }
        />
      ) : (
        <GenerateResumeForm jobPostings={jobPostings} selectedId={selectedId} />
      )}
    </div>
  );
}
