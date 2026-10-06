import Link from "next/link";

import { requireSession } from "@/lib/auth/session";
import { NewJobPostingFlow } from "@/components/jobs/new-job-posting-flow";

export default async function NewJobPostingPage() {
  await requireSession();

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 p-6 dark:bg-black">
      <div className="flex w-full max-w-2xl flex-col gap-6 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
            Nova vaga
          </h1>
          <Link
            href="/jobs"
            className="text-sm font-medium text-zinc-600 hover:underline dark:text-zinc-400"
          >
            Voltar às vagas
          </Link>
        </div>

        <NewJobPostingFlow />
      </div>
    </div>
  );
}
