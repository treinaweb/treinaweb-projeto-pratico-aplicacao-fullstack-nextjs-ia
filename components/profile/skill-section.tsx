"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";

import {
  createSkill,
  deleteSkill,
  updateSkill,
} from "@/app/(app)/profile/actions";
import type { SkillModel } from "@/lib/generated/prisma/models";
import { Button } from "@/components/ui/button";
import { SectionTitle } from "@/components/profile/section-title";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function SkillFields({
  idPrefix,
  item,
  fieldErrors,
}: {
  idPrefix: string;
  item?: SkillModel;
  fieldErrors?: Record<string, string>;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={`${idPrefix}-name`}>Habilidade</Label>
      <Input
        id={`${idPrefix}-name`}
        name="name"
        defaultValue={item?.name ?? ""}
      />
      {fieldErrors?.name && (
        <p className="text-sm text-destructive">{fieldErrors.name}</p>
      )}
    </div>
  );
}

function EditSkillForm({
  item,
  onDone,
}: {
  item: SkillModel;
  onDone: () => void;
}) {
  const boundAction = updateSkill.bind(null, item.id);
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
      className="flex items-end gap-3 rounded-md border border-border p-4"
    >
      <div className="flex-1">
        <SkillFields
          idPrefix={`edit-${item.id}`}
          item={item}
          fieldErrors={state?.fieldErrors}
        />
        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      </div>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Salvando..." : "Salvar"}
      </Button>
      <Button type="button" size="sm" variant="outline" onClick={onDone}>
        Cancelar
      </Button>
    </form>
  );
}

export function SkillSection({ items }: { items: SkillModel[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [createState, createAction, creating] = useActionState(
    createSkill,
    undefined,
  );

  return (
    <Card>
      <CardHeader>
        <SectionTitle icon={Sparkles} title="Habilidades" count={items.length} />
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {items.map((item) =>
          editingId === item.id ? (
            <EditSkillForm
              key={item.id}
              item={item}
              onDone={() => setEditingId(null)}
            />
          ) : (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 rounded-md border border-border p-3"
            >
              <p className="text-foreground">{item.name}</p>
              <div className="flex shrink-0 gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingId(item.id)}
                >
                  Editar
                </Button>
                <form action={deleteSkill.bind(null, item.id)}>
                  <Button type="submit" size="sm" variant="outline">
                    Remover
                  </Button>
                </form>
              </div>
            </div>
          ),
        )}

        <form action={createAction} className="flex items-end gap-3">
          <div className="flex-1">
            <SkillFields
              idPrefix="create-skill"
              fieldErrors={createState?.fieldErrors}
            />
          </div>
          <Button type="submit" size="sm" disabled={creating}>
            {creating ? "Adicionando..." : "Adicionar"}
          </Button>
        </form>
        {createState?.error && (
          <p className="text-sm text-destructive">{createState.error}</p>
        )}
      </CardContent>
    </Card>
  );
}
