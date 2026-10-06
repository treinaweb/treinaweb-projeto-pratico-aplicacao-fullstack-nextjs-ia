import type { UIMessage } from "ai";
import type { ReactNode } from "react";

import {
  ANALYSIS_LABELS,
  CRITERION_LABELS,
  analysisLanguage,
} from "@/lib/interview-analysis/labels";
import type {
  CriterionKey,
  InterviewAnalysisContent,
} from "@/lib/validation/interview-analysis";

const CRITERIA: CriterionKey[] = [
  "communication",
  "technicalKnowledge",
  "roleFit",
  "concreteExamples",
];

function scoreColor(score: number) {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-sky-500";
  if (score >= 40) return "bg-amber-500";
  return "bg-red-500";
}

function textOf(message: UIMessage | undefined) {
  return (
    message?.parts
      .map((part) => (part.type === "text" ? part.text : ""))
      .join("") ?? ""
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-black dark:text-zinc-50">
        {title}
      </h3>
      <ul className="ml-5 list-disc space-y-1 text-sm">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function Labeled({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <div className="whitespace-pre-wrap">{children}</div>
    </div>
  );
}

export function InterviewAnalysisView({
  content,
  language,
  messages,
}: {
  content: InterviewAnalysisContent;
  language: string;
  messages: UIMessage[];
}) {
  const lang = analysisLanguage(language);
  const labels = ANALYSIS_LABELS[lang];
  const indexById = new Map(messages.map((message, index) => [message.id, index]));

  return (
    <section className="flex flex-col gap-6 rounded-xl bg-white p-6 text-zinc-800 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:text-zinc-200 dark:ring-zinc-800">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
          {labels.title}
        </h2>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-zinc-500">
            {labels.overall}
          </p>
          <p className="text-3xl font-semibold text-black dark:text-zinc-50">
            {content.overallScore}
            <span className="text-base font-normal text-zinc-500">/100</span>
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-black dark:text-zinc-50">
          {labels.criteria}
        </h3>
        {CRITERIA.map((key) => {
          const score = content.criteria[key];
          return (
            <div key={key} className="flex flex-col gap-1">
              <div className="flex justify-between text-sm">
                <span>{CRITERION_LABELS[lang][key]}</span>
                <span className="font-medium">{score}</span>
              </div>
              <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div
                  className={`h-2 rounded-full ${scoreColor(score)}`}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <List title={labels.strengths} items={content.strengths} />
        <List title={labels.weaknesses} items={content.weaknesses} />
      </div>
      <List title={labels.suggestions} items={content.suggestions} />

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-black dark:text-zinc-50">
          {labels.answers}
        </h3>
        {content.answers.map((item, number) => {
          const index = indexById.get(item.answerId) ?? -1;
          const answer = messages[index];
          const question = messages[index - 1];
          return (
            <div
              key={item.answerId}
              className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 text-sm dark:border-zinc-800"
            >
              <Labeled label={`${labels.question} ${number + 1}`}>
                {textOf(question)}
              </Labeled>
              <Labeled label={labels.answer}>
                <span className="text-zinc-600 dark:text-zinc-400">
                  {textOf(answer)}
                </span>
              </Labeled>
              <Labeled label={labels.comment}>{item.comment}</Labeled>
              <Labeled label={labels.suggestion}>{item.suggestion}</Labeled>
            </div>
          );
        })}
      </div>
    </section>
  );
}
