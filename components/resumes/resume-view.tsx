import type { ReactNode } from "react";

import {
  PROFICIENCY_LABELS,
  RESUME_LABELS,
  formatMonth,
  formatPeriod,
} from "@/lib/resume/labels";
import type { ResumeContent } from "@/lib/validation/resume";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="border-b border-zinc-200 pb-1 text-sm font-semibold uppercase tracking-wide text-zinc-700">
        {title}
      </h2>
      {children}
    </section>
  );
}

// Section order here must match lib/pdf/resume-template.tsx.
// A white "paper" sheet on the dark app, like the exported PDF: the fixed
// light colors are intentional, and there must be no dark: variants.
export function ResumeView({ content }: { content: ResumeContent }) {
  const { language, contact } = content;
  const labels = RESUME_LABELS[language];
  const contactLine = [contact.email, contact.phone, contact.location].filter(
    Boolean,
  );

  return (
    <article className="flex flex-col gap-6 rounded-sm bg-white p-8 text-sm text-zinc-800 shadow-2xl shadow-black/40 ring-1 ring-black/5 sm:p-12">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-zinc-900">
          {contact.name}
        </h1>
        <p className="text-base text-zinc-700">
          {content.headline}
        </p>
        <p className="text-zinc-600">
          {contactLine.join(" · ")}
        </p>
        {contact.links.length > 0 && (
          <p className="flex flex-wrap gap-x-3 text-zinc-600">
            {contact.links.map((link) => (
              <a
                key={link.url}
                href={link.url}
                className="underline"
                target="_blank"
                rel="noreferrer"
              >
                {link.label}
              </a>
            ))}
          </p>
        )}
      </header>

      {content.summary && (
        <Section title={labels.summary}>
          <p className="leading-relaxed">{content.summary}</p>
        </Section>
      )}

      {content.experiences.length > 0 && (
        <Section title={labels.experiences}>
          {content.experiences.map((item, index) => (
            <div key={index} className="flex flex-col gap-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                <p className="font-medium text-zinc-900">
                  {item.role} · {item.company}
                </p>
                <p className="text-zinc-500">
                  {formatPeriod(item.startDate, item.endDate, language)}
                </p>
              </div>
              {item.highlights.length > 0 && (
                <ul className="ml-5 list-disc">
                  {item.highlights.map((highlight, i) => (
                    <li key={i}>{highlight}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </Section>
      )}

      {content.education.length > 0 && (
        <Section title={labels.education}>
          {content.education.map((item, index) => (
            <div
              key={index}
              className="flex flex-wrap items-baseline justify-between gap-x-4"
            >
              <p>
                <span className="font-medium text-zinc-900">
                  {item.degree}
                </span>{" "}
                · {item.institution}
              </p>
              <p className="text-zinc-500">
                {formatPeriod(item.startDate, item.endDate, language)}
              </p>
            </div>
          ))}
        </Section>
      )}

      {content.courses.length > 0 && (
        <Section title={labels.courses}>
          <ul className="flex flex-col gap-1">
            {content.courses.map((item, index) => (
              <li key={index}>
                <span className="font-medium text-zinc-900">
                  {item.name}
                </span>
                {[
                  item.institution,
                  item.completedAt && formatMonth(item.completedAt, language),
                  item.workloadHours && labels.hours(item.workloadHours),
                ]
                  .filter(Boolean)
                  .map((part) => ` · ${part}`)}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {content.projects.length > 0 && (
        <Section title={labels.projects}>
          {content.projects.map((item, index) => (
            <div key={index} className="flex flex-col gap-1">
              <p className="font-medium text-zinc-900">
                {item.name}
                {item.link && (
                  <>
                    {" · "}
                    <a
                      href={item.link}
                      className="font-normal underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {item.link}
                    </a>
                  </>
                )}
              </p>
              {item.description && <p>{item.description}</p>}
            </div>
          ))}
        </Section>
      )}

      {content.skills.length > 0 && (
        <Section title={labels.skills}>
          <p>{content.skills.join(" · ")}</p>
        </Section>
      )}

      {content.languages.length > 0 && (
        <Section title={labels.languages}>
          <p>
            {content.languages
              .map(
                (item) =>
                  `${item.name} (${PROFICIENCY_LABELS[language][item.proficiency]})`,
              )
              .join(" · ")}
          </p>
        </Section>
      )}
    </article>
  );
}
