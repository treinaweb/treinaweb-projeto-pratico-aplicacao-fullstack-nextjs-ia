import Link from "next/link";
import { notFound } from "next/navigation";

import { requireSession } from "@/lib/auth/session";
import { getInterview } from "@/lib/db/repositories/interviews";
import { getInterviewAnalysis } from "@/lib/db/repositories/interview-analyses";
import { GenerateAnalysisButton } from "@/components/interviews/generate-analysis-button";
import { InterviewAnalysisView } from "@/components/interviews/interview-analysis";
import { InterviewChat } from "@/components/interviews/interview-chat";
import { Card, CardContent } from "@/components/ui/card";

// Generating the analysis (Server Action on this page) can take a while.
export const maxDuration = 120;

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
  const completed = interview.status === "COMPLETED";
  const analysis = completed
    ? await getInterviewAnalysis(session.user.id, interview.id)
    : null;
  const hasAnswers = interview.messages.some(
    (message) => message.role === "user",
  );

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

        {completed &&
          (analysis ? (
            <InterviewAnalysisView
              content={analysis.content}
              language={interview.language}
              messages={interview.messages}
            />
          ) : (
            <Card>
              <CardContent>
                {hasAnswers ? (
                  <GenerateAnalysisButton interviewId={interview.id} />
                ) : (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Esta entrevista foi encerrada antes de você responder
                    alguma pergunta, então não há respostas para analisar.
                  </p>
                )}
              </CardContent>
            </Card>
          ))}

        <InterviewChat
          interviewId={interview.id}
          initialMessages={interview.messages}
          completed={completed}
        />
      </div>
    </div>
  );
}
