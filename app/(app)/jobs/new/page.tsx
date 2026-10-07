import { requireSession } from "@/lib/auth/session";
import { PageHeader } from "@/components/layout/page-header";
import { NewJobPostingFlow } from "@/components/jobs/new-job-posting-flow";

export default async function NewJobPostingPage() {
  await requireSession();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <PageHeader
        back={{ href: "/jobs", label: "Vagas" }}
        title="Nova vaga"
        description="Cole o anúncio; a IA extrai os dados e você revisa antes de salvar."
      />
      <NewJobPostingFlow />
    </div>
  );
}
