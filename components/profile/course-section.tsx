"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Award } from "lucide-react";

import {
  createCourse,
  deleteCourse,
  updateCourse,
} from "@/app/(app)/profile/actions";
import type { CourseModel } from "@/lib/generated/prisma/models";
import { Button } from "@/components/ui/button";
import { SectionTitle } from "@/components/profile/section-title";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function toDateInputValue(date: Date | null) {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

function CourseFields({
  idPrefix,
  item,
  fieldErrors,
}: {
  idPrefix: string;
  item?: CourseModel;
  fieldErrors?: Record<string, string>;
}) {
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${idPrefix}-name`}>Nome do curso</Label>
        <Input
          id={`${idPrefix}-name`}
          name="name"
          defaultValue={item?.name ?? ""}
        />
        {fieldErrors?.name && (
          <p className="text-sm text-destructive">{fieldErrors.name}</p>
        )}
      </div>
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
      <div className="flex gap-4">
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor={`${idPrefix}-completedAt`}>Conclusão</Label>
          <Input
            id={`${idPrefix}-completedAt`}
            name="completedAt"
            type="date"
            defaultValue={toDateInputValue(item?.completedAt ?? null)}
          />
          {fieldErrors?.completedAt && (
            <p className="text-sm text-destructive">{fieldErrors.completedAt}</p>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor={`${idPrefix}-workloadHours`}>
            Carga horária (horas)
          </Label>
          <Input
            id={`${idPrefix}-workloadHours`}
            name="workloadHours"
            type="number"
            min={1}
            defaultValue={item?.workloadHours ?? ""}
          />
          {fieldErrors?.workloadHours && (
            <p className="text-sm text-destructive">{fieldErrors.workloadHours}</p>
          )}
        </div>
      </div>
    </>
  );
}

function EditCourseForm({
  item,
  onDone,
}: {
  item: CourseModel;
  onDone: () => void;
}) {
  const boundAction = updateCourse.bind(null, item.id);
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
      <CourseFields
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

export function CourseSection({ items }: { items: CourseModel[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [createState, createAction, creating] = useActionState(
    createCourse,
    undefined,
  );

  return (
    <Card>
      <CardHeader>
        <SectionTitle icon={Award} title="Cursos e certificações" count={items.length} />
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {items.map((item) =>
          editingId === item.id ? (
            <EditCourseForm
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
                  {item.name}
                </p>
                {item.institution && (
                  <p className="text-sm text-muted-foreground">
                    {item.institution}
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
                <form action={deleteCourse.bind(null, item.id)}>
                  <Button type="submit" size="sm" variant="outline">
                    Remover
                  </Button>
                </form>
              </div>
            </div>
          ),
        )}

        <form action={createAction} className="flex flex-col gap-3">
          <CourseFields
            idPrefix="create-course"
            fieldErrors={createState?.fieldErrors}
          />
          {createState?.error && (
            <p className="text-sm text-destructive">{createState.error}</p>
          )}
          <Button type="submit" size="sm" disabled={creating} className="self-start">
            {creating ? "Adicionando..." : "Adicionar curso"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
