"use client";

import { useActionState } from "react";

import { generateAnalysisAction } from "@/app/(app)/interviews/actions";
import { Button } from "@/components/ui/button";

export function GenerateAnalysisButton({ interviewId }: { interviewId: string }) {
  const [state, formAction, pending] = useActionState(
    generateAnalysisAction.bind(null, interviewId),
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        Receba uma avaliação da entrevista: nota geral, notas por critério,
        pontos fortes, pontos fracos e um feedback para cada resposta.
      </p>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Gerando análise… (pode levar até 30 s)" : "Gerar análise"}
      </Button>
    </form>
  );
}
