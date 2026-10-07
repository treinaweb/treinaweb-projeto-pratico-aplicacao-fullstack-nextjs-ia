import { Check } from "lucide-react";
import { cn } from "cn";

import type { OnboardingStep } from "@/lib/dashboard/metrics";
import { Progress } from "@/components/ui/progress";

export function OnboardingChecklist({ steps }: { steps: OnboardingStep[] }) {
  const done = steps.filter((step) => step.done).length;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">
          {done} de {steps.length} etapas concluídas. Sua evolução aparece aqui depois da
          primeira análise.
        </p>
        <Progress value={(done / steps.length) * 100} aria-label="Progresso da jornada" />
      </div>
      <ol className="flex flex-col gap-1">
        {steps.map((step, index) => (
          <li key={step.label} className="flex items-center gap-3 py-1.5">
            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                step.done
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground ring-1 ring-input",
              )}
            >
              {step.done ? <Check className="size-4" aria-hidden /> : index + 1}
            </span>
            <span className={cn("text-sm", step.done ? "text-muted-foreground line-through" : "text-foreground")}>
              {step.label}
            </span>
            <span className="sr-only">{step.done ? "(concluída)" : "(pendente)"}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
