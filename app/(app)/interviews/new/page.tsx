import Link from "next/link";
import { FileText } from "lucide-react";

import { requireSession } from "@/lib/auth/session";
import { listResumes } from "@/lib/db/repositories/resumes";
import { StartInterviewForm } from "@/components/interviews/start-interview-form";
import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";

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
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <PageHeader
        back={{ href: "/interviews", label: "Entrevistas" }}
        title="Nova entrevista"
        description="Treine com um entrevistador de IA baseado na vaga e no seu currículo."
      />

      {options.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Nenhum currículo gerado"
          description="A entrevista simulada usa um currículo gerado para a vaga. Gere um currículo primeiro."
          action={
            <Link href="/resumes/new" className={buttonVariants({ variant: "cta" })}>
              Gerar currículo
            </Link>
          }
        />
      ) : (
        <StartInterviewForm resumes={options} selectedId={selectedId} />
      )}
    </div>
  );
}
