"use client";

import { useActionState, useState, startTransition } from "react";

import {
  createJobPostingAction,
  parseJobPostingAction,
} from "@/app/(app)/jobs/actions";
import type { JobPostingData } from "@/lib/validation/job-posting";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WORK_MODEL_LABELS } from "@/lib/jobs/labels";

const TEXTAREA_CLASS =
  "rounded-lg border border-input bg-input/30 px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-destructive">{message}</p>;
}

function TextField({
  name,
  label,
  defaultValue,
  error,
}: {
  name: string;
  label: string;
  defaultValue: string | null;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} defaultValue={defaultValue ?? ""} />
      <FieldError message={error} />
    </div>
  );
}

function ListField({
  name,
  label,
  defaultValue,
  error,
}: {
  name: string;
  label: string;
  defaultValue: string[];
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <textarea
        id={name}
        name={name}
        defaultValue={defaultValue.join("\n")}
        rows={Math.max(3, defaultValue.length + 1)}
        className={TEXTAREA_CLASS}
      />
      <p className="text-xs text-muted-foreground">Um item por linha.</p>
      <FieldError message={error} />
    </div>
  );
}

function ReviewForm({
  extracted,
  rawText,
  onBack,
}: {
  extracted: JobPostingData;
  rawText: string;
  onBack: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    createJobPostingAction,
    undefined,
  );
  const errors = state?.fieldErrors;

  // Submitting through a transition (instead of `action=`) keeps the
  // candidate's edits in place when validation fails.
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revise os dados da vaga</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="hidden" name="rawText" value={rawText} />

          <TextField
            name="title"
            label="Título"
            defaultValue={extracted.title}
            error={errors?.title}
          />
          <TextField
            name="company"
            label="Empresa"
            defaultValue={extracted.company}
            error={errors?.company}
          />
          <TextField
            name="location"
            label="Localização"
            defaultValue={extracted.location}
            error={errors?.location}
          />

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="workModel">Modelo de trabalho</Label>
            <select
              id="workModel"
              name="workModel"
              defaultValue={extracted.workModel ?? ""}
              className={TEXTAREA_CLASS}
            >
              <option value="">Não informado</option>
              {Object.entries(WORK_MODEL_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <FieldError message={errors?.workModel} />
          </div>

          <TextField
            name="employmentType"
            label="Tipo de contratação"
            defaultValue={extracted.employmentType}
            error={errors?.employmentType}
          />
          <TextField
            name="seniority"
            label="Senioridade"
            defaultValue={extracted.seniority}
            error={errors?.seniority}
          />
          <TextField
            name="salary"
            label="Salário"
            defaultValue={extracted.salary}
            error={errors?.salary}
          />

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="summary">Resumo</Label>
            <textarea
              id="summary"
              name="summary"
              defaultValue={extracted.summary ?? ""}
              rows={3}
              className={TEXTAREA_CLASS}
            />
            <FieldError message={errors?.summary} />
          </div>

          <ListField
            name="responsibilities"
            label="Responsabilidades"
            defaultValue={extracted.responsibilities}
            error={errors?.responsibilities}
          />
          <ListField
            name="requirements"
            label="Requisitos"
            defaultValue={extracted.requirements}
            error={errors?.requirements}
          />
          <ListField
            name="niceToHave"
            label="Diferenciais"
            defaultValue={extracted.niceToHave}
            error={errors?.niceToHave}
          />
          <ListField
            name="benefits"
            label="Benefícios"
            defaultValue={extracted.benefits}
            error={errors?.benefits}
          />

          <FieldError message={errors?.rawText ?? state?.error} />

          <div className="flex gap-2">
            <Button type="submit" disabled={pending}>
              {pending ? "Salvando..." : "Salvar vaga"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={pending}
            >
              Voltar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function NewJobPostingFlow() {
  const [rawText, setRawText] = useState("");
  const [parseState, parseAction, parsing] = useActionState(
    parseJobPostingAction,
    undefined,
  );
  // The parse result the candidate went back from; its review is hidden.
  const [dismissed, setDismissed] = useState<typeof parseState>(undefined);

  if (parseState?.extracted && parseState !== dismissed) {
    return (
      <ReviewForm
        extracted={parseState.extracted}
        rawText={parseState.rawText}
        onBack={() => setDismissed(parseState)}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cole o texto da vaga</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={parseAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rawText">Texto da vaga</Label>
            <textarea
              id="rawText"
              name="rawText"
              value={rawText}
              onChange={(event) => setRawText(event.target.value)}
              rows={14}
              placeholder="Copie e cole aqui o anúncio completo da vaga."
              className={TEXTAREA_CLASS}
            />
            <FieldError message={parseState?.error} />
          </div>
          <Button type="submit" disabled={parsing} className="self-start">
            {parsing ? "Analisando vaga…" : "Analisar vaga"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
