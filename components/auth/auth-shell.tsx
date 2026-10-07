import Link from "next/link";
import type { ReactNode } from "react";
import { CircleCheck } from "lucide-react";

import { Brand } from "@/components/layout/brand";

const BENEFITS = [
  "Currículo adaptado para cada vaga, sem inventar nada",
  "Entrevista simulada com um entrevistador de IA",
  "Nota e feedback para saber o que treinar",
];

// Split screen for login and registration: form on the left, value
// proposition on the right (hidden below lg).
export function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="grid flex-1 lg:grid-cols-2">
      <div className="flex flex-col p-6 sm:p-10">
        <Link href="/" aria-label="TWJobs AI — início" className="w-fit">
          <Brand />
        </Link>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="flex w-full max-w-sm flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            {children}
          </div>
        </div>
      </div>

      <aside className="relative hidden overflow-hidden border-l border-border bg-secondary lg:flex">
        <div aria-hidden className="bg-glow absolute inset-0" />
        <div aria-hidden className="bg-grid absolute inset-0" />
        <div className="relative flex flex-1 flex-col justify-center gap-8 p-12 xl:p-16">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-cta/45 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-cta">
            <span className="size-2 rounded-full bg-cta shadow-[0_0_8px_var(--cta)]" />
            TWJobs AI
          </span>
          <p className="max-w-md text-4xl leading-[1.1] font-bold tracking-[-0.03em] text-foreground">
            Prepare-se para a vaga certa com a{" "}
            <span className="text-primary">IA do seu lado</span>
          </p>
          <ul className="flex flex-col gap-3">
            {BENEFITS.map((benefit) => (
              <li key={benefit} className="flex items-center gap-3 text-body">
                <CircleCheck className="size-5 shrink-0 text-cta" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
