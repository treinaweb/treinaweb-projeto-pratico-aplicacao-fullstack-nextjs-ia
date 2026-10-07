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
import {
  SCORE_BAND_FILL,
  SCORE_BAND_TEXT,
  ScoreBadge,
  scoreBand,
} from "@/components/ui/score-badge";

const CRITERIA: CriterionKey[] = [
  "communication",
  "technicalKnowledge",
  "roleFit",
  "concreteExamples",
];

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
      <h3 className="text-sm font-semibold text-foreground">
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
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
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
    <section className="flex flex-col gap-6 rounded-xl border border-border bg-card p-6 text-body">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-foreground">
          {labels.title}
        </h2>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {labels.overall}
          </p>
          <p className="flex items-center justify-end gap-2">
            <span
              className={`text-4xl font-bold tabular-nums ${SCORE_BAND_TEXT[scoreBand(content.overallScore)]}`}
            >
              {content.overallScore}
            </span>
            <span className="text-base font-normal text-muted-foreground">/100</span>
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-foreground">
          {labels.criteria}
        </h3>
        {CRITERIA.map((key) => {
          const score = content.criteria[key];
          return (
            <div key={key} className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-sm">
                <span>{CRITERION_LABELS[lang][key]}</span>
                <ScoreBadge score={score} prefix="" />
              </div>
              <div className="h-2 rounded-full bg-secondary">
                <div
                  className={`h-2 rounded-full ${SCORE_BAND_FILL[scoreBand(score)]}`}
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
        <h3 className="text-sm font-semibold text-foreground">
          {labels.answers}
        </h3>
        {content.answers.map((item, number) => {
          const index = indexById.get(item.answerId) ?? -1;
          const answer = messages[index];
          const question = messages[index - 1];
          return (
            <div
              key={item.answerId}
              className="flex flex-col gap-3 rounded-lg border border-border p-4 text-sm"
            >
              <Labeled label={`${labels.question} ${number + 1}`}>
                {textOf(question)}
              </Labeled>
              <Labeled label={labels.answer}>
                <span className="text-muted-foreground">
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
