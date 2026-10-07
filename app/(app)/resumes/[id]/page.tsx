import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, MessagesSquare } from "lucide-react";

import { requireSession } from "@/lib/auth/session";
import { getResume } from "@/lib/db/repositories/resumes";
import { PageHeader } from "@/components/layout/page-header";
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
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      <PageHeader
        back={{ href: "/resumes", label: "Currículos" }}
        title="Currículo"
        description={
          <>
            Para {resume.jobPosting.title}
            {resume.jobPosting.company && ` · ${resume.jobPosting.company}`}
          </>
        }
        actions={
          <>
            <Link
              href={`/interviews/new?resumeId=${resume.id}`}
              className={buttonVariants({ variant: "outline" })}
            >
              <MessagesSquare data-icon="inline-start" />
              Simular entrevista
            </Link>
            {/* Plain anchor: the PDF is a file download, not a page. */}
            <a href={`/resumes/${resume.id}/pdf`} className={buttonVariants()}>
              <Download data-icon="inline-start" />
              Baixar PDF
            </a>
          </>
        }
      />

      <ResumeView content={resume.content} />
    </div>
  );
}
