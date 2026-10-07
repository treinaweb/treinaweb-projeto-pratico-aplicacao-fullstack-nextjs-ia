"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Link2 } from "lucide-react";

import { createLink, deleteLink, updateLink } from "@/app/(app)/profile/actions";
import type { ProfileLinkModel } from "@/lib/generated/prisma/models";
import { Button } from "@/components/ui/button";
import { SectionTitle } from "@/components/profile/section-title";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function LinkFields({
  idPrefix,
  item,
  fieldErrors,
}: {
  idPrefix: string;
  item?: ProfileLinkModel;
  fieldErrors?: Record<string, string>;
}) {
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${idPrefix}-label`}>Rótulo</Label>
        <Input
          id={`${idPrefix}-label`}
          name="label"
          placeholder="Ex: LinkedIn, GitHub, Portfólio"
          defaultValue={item?.label ?? ""}
        />
        {fieldErrors?.label && (
          <p className="text-sm text-destructive">{fieldErrors.label}</p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${idPrefix}-url`}>URL</Label>
        <Input
          id={`${idPrefix}-url`}
          name="url"
          type="url"
          placeholder="https://..."
          defaultValue={item?.url ?? ""}
        />
        {fieldErrors?.url && (
          <p className="text-sm text-destructive">{fieldErrors.url}</p>
        )}
      </div>
    </>
  );
}

function EditLinkForm({
  item,
  onDone,
}: {
  item: ProfileLinkModel;
  onDone: () => void;
}) {
  const boundAction = updateLink.bind(null, item.id);
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
      <LinkFields
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

export function LinkSection({ items }: { items: ProfileLinkModel[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [createState, createAction, creating] = useActionState(
    createLink,
    undefined,
  );

  return (
    <Card>
      <CardHeader>
        <SectionTitle icon={Link2} title="Links úteis" count={items.length} />
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {items.map((item) =>
          editingId === item.id ? (
            <EditLinkForm
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
                  {item.label}
                </p>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  {item.url}
                </a>
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
                <form action={deleteLink.bind(null, item.id)}>
                  <Button type="submit" size="sm" variant="outline">
                    Remover
                  </Button>
                </form>
              </div>
            </div>
          ),
        )}

        <form action={createAction} className="flex flex-col gap-3">
          <LinkFields
            idPrefix="create-link"
            fieldErrors={createState?.fieldErrors}
          />
          {createState?.error && (
            <p className="text-sm text-destructive">{createState.error}</p>
          )}
          <Button type="submit" size="sm" disabled={creating} className="self-start">
            {creating ? "Adicionando..." : "Adicionar link"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
