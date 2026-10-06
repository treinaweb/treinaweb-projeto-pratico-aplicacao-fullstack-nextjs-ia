import Link from "next/link";
import { notFound } from "next/navigation";

import { requireSession } from "@/lib/auth/session";
import { getResume } from "@/lib/db/repositories/resumes";
import { ResumeView } from "@/components/resumes/resume-view";
import { buttonVariants } from "@/components/ui/button";

export default async function ResumePage({ params }: PageProps<"/resumes/[id]">) {
  const session = await requireSession();
  const { id } = await params;

  const resume = await getResume(session.user.id, id);
  if (!resume) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 p-6 dark:bg-black">
      <div className="flex w-full max-w-3xl flex-col gap-6 py-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
              Currículo
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Para {resume.jobPosting.title}
              {resume.jobPosting.company && ` · ${resume.jobPosting.company}`}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/resumes"
              className="text-sm font-medium text-zinc-600 hover:underline dark:text-zinc-400"
            >
              Voltar
            </Link>
            <Link
              href={`/interviews/new?resumeId=${resume.id}`}
              className={buttonVariants({ variant: "outline" })}
            >
              Simular entrevista
            </Link>
            {/* Plain anchor: the PDF is a file download, not a page. */}
            <a href={`/resumes/${resume.id}/pdf`} className={buttonVariants()}>
              Baixar PDF
            </a>
          </div>
        </div>

        <ResumeView content={resume.content} />
      </div>
    </div>
  );
}
