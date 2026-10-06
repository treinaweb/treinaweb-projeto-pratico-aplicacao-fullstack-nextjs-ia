import Link from "next/link";
import { notFound } from "next/navigation";

import { requireSession } from "@/lib/auth/session";
import { getInterview } from "@/lib/db/repositories/interviews";
import { InterviewChat } from "@/components/interviews/interview-chat";

export default async function InterviewPage({
  params,
}: PageProps<"/interviews/[id]">) {
  const session = await requireSession();
  const { id } = await params;

  const interview = await getInterview(session.user.id, id);
  if (!interview) {
    notFound();
  }
  const posting = interview.resume.jobPosting;

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 p-6 dark:bg-black">
      <div className="flex w-full max-w-3xl flex-col gap-6 py-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
              Entrevista simulada
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {posting.title}
              {posting.company && ` · ${posting.company}`}
            </p>
          </div>
          <Link
            href="/interviews"
            className="text-sm font-medium text-zinc-600 hover:underline dark:text-zinc-400"
          >
            Voltar às entrevistas
          </Link>
        </div>

        <InterviewChat
          interviewId={interview.id}
          initialMessages={interview.messages}
          completed={interview.status === "COMPLETED"}
        />
      </div>
    </div>
  );
}
