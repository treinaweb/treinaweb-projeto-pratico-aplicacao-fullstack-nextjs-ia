"use client";

import { useActionState } from "react";

import { startInterviewAction } from "@/app/(app)/interviews/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export function StartInterviewForm({
  resumes,
  selectedId,
}: {
  resumes: { id: string; label: string }[];
  selectedId?: string;
}) {
  const [state, formAction, pending] = useActionState(
    startInterviewAction,
    undefined,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Simular entrevista</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="resumeId">Currículo</Label>
            <select
              id="resumeId"
              name="resumeId"
              defaultValue={selectedId ?? resumes[0]?.id}
              className="rounded-lg border border-input bg-input/30 px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {resumes.map((resume) => (
                <option key={resume.id} value={resume.id}>
                  {resume.label}
                </option>
              ))}
            </select>
          </div>

          <p className="text-sm text-muted-foreground">
            Um entrevistador de IA fará até 8 perguntas, comportamentais e
            técnicas, com base na vaga e no currículo escolhido. Você pode
            pausar e continuar depois, ou encerrar quando quiser.
          </p>

          {state?.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <Button type="submit" disabled={pending} className="self-start">
            {pending ? "Preparando entrevista…" : "Iniciar entrevista"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
