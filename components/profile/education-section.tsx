"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { GraduationCap } from "lucide-react";

import {
  createEducation,
  deleteEducation,
  updateEducation,
} from "@/app/(app)/profile/actions";
import type { EducationModel } from "@/lib/generated/prisma/models";
import { Button } from "@/components/ui/button";
import { SectionTitle } from "@/components/profile/section-title";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function toDateInputValue(date: Date | null) {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

function formatPeriod(start: Date, end: Date | null) {
  const startLabel = start.toLocaleDateString("pt-BR", {
    month: "short",
    year: "numeric",
  });
  const endLabel = end
    ? end.toLocaleDateString("pt-BR", { month: "short", year: "numeric" })
    : "Atual";
  return `${startLabel} - ${endLabel}`;
}

function EducationFields({
  idPrefix,
  item,
  fieldErrors,
}: {
  idPrefix: string;
  item?: EducationModel;
  fieldErrors?: Record<string, string>;
}) {
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${idPrefix}-institution`}>Instituição</Label>
        <Input
          id={`${idPrefix}-institution`}
          name="institution"
          defaultValue={item?.institution ?? ""}
        />
        {fieldErrors?.institution && (
          <p className="text-sm text-destructive">{fieldErrors.institution}</p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${idPrefix}-degree`}>Curso/grau</Label>
        <Input
          id={`${idPrefix}-degree`}
          name="degree"
          defaultValue={item?.degree ?? ""}
        />
        {fieldErrors?.degree && (
          <p className="text-sm text-destructive">{fieldErrors.degree}</p>
        )}
      </div>
      <div className="flex gap-4">
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor={`${idPrefix}-startDate`}>Início</Label>
          <Input
            id={`${idPrefix}-startDate`}
            name="startDate"
            type="date"
            defaultValue={toDateInputValue(item?.startDate ?? null)}
          />
          {fieldErrors?.startDate && (
            <p className="text-sm text-destructive">{fieldErrors.startDate}</p>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor={`${idPrefix}-endDate`}>
            Fim (deixe vazio se em andamento)
          </Label>
          <Input
            id={`${idPrefix}-endDate`}
            name="endDate"
            type="date"
            defaultValue={toDateInputValue(item?.endDate ?? null)}
          />
          {fieldErrors?.endDate && (
            <p className="text-sm text-destructive">{fieldErrors.endDate}</p>
          )}
        </div>
      </div>
    </>
  );
}

function EditEducationForm({
  item,
  onDone,
}: {
  item: EducationModel;
  onDone: () => void;
}) {
  const boundAction = updateEducation.bind(null, item.id);
  const [state, formAction, pending] = useActionState(boundAction, undefined);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state?.error && !state?.fieldErrors) {
      onDone();
    }
    wasPending.current = pending;
  }, [pending, state, onDone]);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-md border border-border p-4"
    >
      <EducationFields
        idPrefix={`edit-${item.id}`}
        item={item}
        fieldErrors={state?.fieldErrors}
      />
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Salvando..." : "Salvar"}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onDone}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

export function EducationSection({ items }: { items: EducationModel[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [createState, createAction, creating] = useActionState(
    createEducation,
    undefined,
  );

  return (
    <Card>
      <CardHeader>
        <SectionTitle icon={GraduationCap} title="Escolaridade" count={items.length} />
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {items.map((item) =>
          editingId === item.id ? (
            <EditEducationForm
              key={item.id}
              item={item}
              onDone={() => setEditingId(null)}
            />
          ) : (
            <div
              key={item.id}
              className="flex items-start justify-between gap-4 rounded-md border border-border p-4"
            >
              <div>
                <p className="font-medium text-foreground">
                  {item.degree} · {item.institution}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatPeriod(item.startDate, item.endDate)}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingId(item.id)}
                >
                  Editar
                </Button>
                <form action={deleteEducation.bind(null, item.id)}>
                  <Button type="submit" size="sm" variant="outline">
                    Remover
                  </Button>
                </form>
              </div>
            </div>
          ),
        )}

        <form action={createAction} className="flex flex-col gap-3">
          <EducationFields
            idPrefix="create-education"
            fieldErrors={createState?.fieldErrors}
          />
          {createState?.error && (
            <p className="text-sm text-destructive">{createState.error}</p>
          )}
          <Button type="submit" size="sm" disabled={creating} className="self-start">
            {creating ? "Adicionando..." : "Adicionar formação"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
