"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { FolderGit2 } from "lucide-react";

import {
  createProject,
  deleteProject,
  updateProject,
} from "@/app/(app)/profile/actions";
import type { ProjectModel } from "@/lib/generated/prisma/models";
import { Button } from "@/components/ui/button";
import { SectionTitle } from "@/components/profile/section-title";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function ProjectFields({
  idPrefix,
  item,
  fieldErrors,
}: {
  idPrefix: string;
  item?: ProjectModel;
  fieldErrors?: Record<string, string>;
}) {
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${idPrefix}-name`}>Nome do projeto</Label>
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
        <Label htmlFor={`${idPrefix}-description`}>Descrição</Label>
        <textarea
          id={`${idPrefix}-description`}
          name="description"
          defaultValue={item?.description ?? ""}
          rows={2}
          className="rounded-lg border border-input bg-input/30 px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        {fieldErrors?.description && (
          <p className="text-sm text-destructive">{fieldErrors.description}</p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${idPrefix}-link`}>Link</Label>
        <Input
          id={`${idPrefix}-link`}
          name="link"
          type="url"
          placeholder="https://..."
          defaultValue={item?.link ?? ""}
        />
        {fieldErrors?.link && (
          <p className="text-sm text-destructive">{fieldErrors.link}</p>
        )}
      </div>
    </>
  );
}

function EditProjectForm({
  item,
  onDone,
}: {
  item: ProjectModel;
  onDone: () => void;
}) {
  const boundAction = updateProject.bind(null, item.id);
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
      <ProjectFields
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

export function ProjectSection({ items }: { items: ProjectModel[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [createState, createAction, creating] = useActionState(
    createProject,
    undefined,
  );

  return (
    <Card>
      <CardHeader>
        <SectionTitle icon={FolderGit2} title="Projetos" count={items.length} />
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {items.map((item) =>
          editingId === item.id ? (
            <EditProjectForm
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
                {item.description && (
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                )}
                {item.link && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    {item.link}
                  </a>
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
                <form action={deleteProject.bind(null, item.id)}>
                  <Button type="submit" size="sm" variant="outline">
                    Remover
                  </Button>
                </form>
              </div>
            </div>
          ),
        )}

        <form action={createAction} className="flex flex-col gap-3">
          <ProjectFields
            idPrefix="create-project"
            fieldErrors={createState?.fieldErrors}
          />
          {createState?.error && (
            <p className="text-sm text-destructive">{createState.error}</p>
          )}
          <Button type="submit" size="sm" disabled={creating} className="self-start">
            {creating ? "Adicionando..." : "Adicionar projeto"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
