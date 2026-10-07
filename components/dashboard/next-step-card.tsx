import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { NextStep } from "@/lib/dashboard/next-step";
import { buttonVariants } from "@/components/ui/button";

export function NextStepCard({ step }: { step: NextStep }) {
  return (
    <section className="relative overflow-hidden rounded-xl border border-primary/30 bg-card">
      <div aria-hidden className="bg-glow absolute inset-0" />
      <div aria-hidden className="bg-grid absolute inset-0 opacity-60" />
      <div className="relative flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-cta/45 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-cta">
            <span className="size-1.5 rounded-full bg-cta shadow-[0_0_8px_var(--cta)]" />
            Próximo passo
          </span>
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {step.title}
          </h2>
          <p className="text-body">{step.description}</p>
        </div>
        <Link
          href={step.href}
          className={buttonVariants({ variant: "cta", size: "lg", className: "shrink-0" })}
        >
          {step.ctaLabel}
          <ArrowRight data-icon="inline-end" />
        </Link>
      </div>
    </section>
  );
}
