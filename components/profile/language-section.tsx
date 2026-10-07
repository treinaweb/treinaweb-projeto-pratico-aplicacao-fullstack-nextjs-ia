"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Languages } from "lucide-react";

import {
  createLanguage,
  deleteLanguage,
  updateLanguage,
} from "@/app/(app)/profile/actions";
import type { LanguageModel } from "@/lib/generated/prisma/models";
import { Button } from "@/components/ui/button";
import { SectionTitle } from "@/components/profile/section-title";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PROFICIENCY_LABELS: Record<string, string> = {
  BASIC: "Básico",
  INTERMEDIATE: "Intermediário",
  ADVANCED: "Avançado",
  FLUENT: "Fluente",
  NATIVE: "Nativo",
};

function LanguageFields({
  idPrefix,
  item,
  fieldErrors,
}: {
  idPrefix: string;
  item?: LanguageModel;
  fieldErrors?: Record<string, string>;
}) {
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${idPrefix}-name`}>Idioma</Label>
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
        <Label htmlFor={`${idPrefix}-proficiency`}>Nível</Label>
        <select
          id={`${idPrefix}-proficiency`}
          name="proficiency"
          defaultValue={item?.proficiency ?? "BASIC"}
          className="rounded-lg border border-input bg-input/30 px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {Object.entries(PROFICIENCY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        {fieldErrors?.proficiency && (
          <p className="text-sm text-destructive">{fieldErrors.proficiency}</p>
        )}
      </div>
    </>
  );
}

function EditLanguageForm({
  item,
  onDone,
}: {
  item: LanguageModel;
  onDone: () => void;
}) {
  const boundAction = updateLanguage.bind(null, item.id);
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
      <LanguageFields
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

export function LanguageSection({ items }: { items: LanguageModel[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [createState, createAction, creating] = useActionState(
    createLanguage,
    undefined,
  );

  return (
    <Card>
      <CardHeader>
        <SectionTitle icon={Languages} title="Idiomas" count={items.length} />
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {items.map((item) =>
          editingId === item.id ? (
            <EditLanguageForm
              key={item.id}
              item={item}
              onDone={() => setEditingId(null)}
            />
          ) : (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 rounded-md border border-border p-3"
            >
              <p className="text-foreground">
                {item.name} · {PROFICIENCY_LABELS[item.proficiency]}
              </p>
              <div className="flex shrink-0 gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingId(item.id)}
                >
                  Editar
                </Button>
                <form action={deleteLanguage.bind(null, item.id)}>
                  <Button type="submit" size="sm" variant="outline">
                    Remover
                  </Button>
                </form>
              </div>
            </div>
          ),
        )}

        <form action={createAction} className="flex flex-col gap-3">
          <LanguageFields
            idPrefix="create-language"
            fieldErrors={createState?.fieldErrors}
          />
          {createState?.error && (
            <p className="text-sm text-destructive">{createState.error}</p>
          )}
          <Button type="submit" size="sm" disabled={creating} className="self-start">
            {creating ? "Adicionando..." : "Adicionar idioma"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
