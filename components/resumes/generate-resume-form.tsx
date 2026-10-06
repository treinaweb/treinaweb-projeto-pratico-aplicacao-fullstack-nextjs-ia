"use client";

import Link from "next/link";
import { useActionState } from "react";

import { generateResumeAction } from "@/app/resumes/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export function GenerateResumeForm({
  jobPostings,
  selectedId,
}: {
  jobPostings: { id: string; title: string; company: string | null }[];
  selectedId?: string;
}) {
  const [state, formAction, pending] = useActionState(
    generateResumeAction,
    undefined,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerar currículo para uma vaga</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="jobPostingId">Vaga</Label>
            <select
              id="jobPostingId"
              name="jobPostingId"
              defaultValue={selectedId ?? jobPostings[0]?.id}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {jobPostings.map((jobPosting) => (
                <option key={jobPosting.id} value={jobPosting.id}>
                  {jobPosting.company
                    ? `${jobPosting.title} · ${jobPosting.company}`
                    : jobPosting.title}
                </option>
              ))}
            </select>
          </div>

          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            A IA usa somente os dados do seu perfil: ela escolhe e reescreve o
            que é relevante para a vaga, sem inventar informações.
          </p>

          {state?.error && (
            <p className="text-sm text-red-600">
              {state.error}{" "}
              {state.emptyProfile && (
                <Link href="/profile" className="font-medium underline">
                  Ir para o perfil
                </Link>
              )}
            </p>
          )}

          <Button type="submit" disabled={pending} className="self-start">
            {pending ? "Gerando currículo…" : "Gerar currículo"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
