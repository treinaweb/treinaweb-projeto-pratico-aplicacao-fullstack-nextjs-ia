"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import {
  createWorkExperience,
  deleteWorkExperience,
  updateWorkExperience,
} from "@/app/profile/actions";
import type { WorkExperienceModel } from "@/lib/generated/prisma/models";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

function WorkExperienceFields({
  idPrefix,
  item,
  fieldErrors,
}: {
  idPrefix: string;
  item?: WorkExperienceModel;
  fieldErrors?: Record<string, string>;
}) {
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${idPrefix}-company`}>Empresa</Label>
        <Input
          id={`${idPrefix}-company`}
          name="company"
          defaultValue={item?.company ?? ""}
        />
        {fieldErrors?.company && (
          <p className="text-sm text-red-600">{fieldErrors.company}</p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${idPrefix}-role`}>Cargo</Label>
        <Input
          id={`${idPrefix}-role`}
          name="role"
          defaultValue={item?.role ?? ""}
        />
        {fieldErrors?.role && (
          <p className="text-sm text-red-600">{fieldErrors.role}</p>
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
            <p className="text-sm text-red-600">{fieldErrors.startDate}</p>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor={`${idPrefix}-endDate`}>Fim (deixe vazio se atual)</Label>
          <Input
            id={`${idPrefix}-endDate`}
            name="endDate"
            type="date"
            defaultValue={toDateInputValue(item?.endDate ?? null)}
          />
          {fieldErrors?.endDate && (
            <p className="text-sm text-red-600">{fieldErrors.endDate}</p>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${idPrefix}-description`}>Descrição</Label>
        <textarea
          id={`${idPrefix}-description`}
          name="description"
          defaultValue={item?.description ?? ""}
          rows={2}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
    </>
  );
}

function EditWorkExperienceForm({
  item,
  onDone,
}: {
  item: WorkExperienceModel;
  onDone: () => void;
}) {
  const boundAction = updateWorkExperience.bind(null, item.id);
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
      <WorkExperienceFields
        idPrefix={`edit-${item.id}`}
        item={item}
        fieldErrors={state?.fieldErrors}
      />
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
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

export function WorkExperienceSection({
  items,
}: {
  items: WorkExperienceModel[];
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [createState, createAction, creating] = useActionState(
    createWorkExperience,
    undefined,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Experiências profissionais</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {items.map((item) =>
          editingId === item.id ? (
            <EditWorkExperienceForm
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
                <p className="font-medium text-black dark:text-zinc-50">
                  {item.role} · {item.company}
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {formatPeriod(item.startDate, item.endDate)}
                </p>
                {item.description && (
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {item.description}
                  </p>
                )}
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
                <form action={deleteWorkExperience.bind(null, item.id)}>
                  <Button type="submit" size="sm" variant="outline">
                    Remover
                  </Button>
                </form>
              </div>
            </div>
          ),
        )}

        <form action={createAction} className="flex flex-col gap-3">
          <WorkExperienceFields
            idPrefix="create-work-experience"
            fieldErrors={createState?.fieldErrors}
          />
          {createState?.error && (
            <p className="text-sm text-red-600">{createState.error}</p>
          )}
          <Button type="submit" size="sm" disabled={creating} className="self-start">
            {creating ? "Adicionando..." : "Adicionar experiência"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
