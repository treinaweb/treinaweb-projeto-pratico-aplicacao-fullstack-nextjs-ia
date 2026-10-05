"use client";

import { useActionState } from "react";

import { updatePersonalInfo } from "@/app/profile/actions";
import type { CandidateProfileModel } from "@/lib/generated/prisma/models";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PersonalInfoForm({
  profile,
}: {
  profile: CandidateProfileModel;
}) {
  const [state, formAction, pending] = useActionState(
    updatePersonalInfo,
    undefined,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações pessoais</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="headline">Headline</Label>
            <Input
              id="headline"
              name="headline"
              defaultValue={profile.headline ?? ""}
              placeholder="Ex: Desenvolvedor(a) Front-end"
            />
            {state?.fieldErrors?.headline && (
              <p className="text-sm text-red-600">
                {state.fieldErrors.headline}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              name="phone"
              defaultValue={profile.phone ?? ""}
            />
            {state?.fieldErrors?.phone && (
              <p className="text-sm text-red-600">{state.fieldErrors.phone}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="location">Localização</Label>
            <Input
              id="location"
              name="location"
              defaultValue={profile.location ?? ""}
              placeholder="Cidade, Estado"
            />
            {state?.fieldErrors?.location && (
              <p className="text-sm text-red-600">
                {state.fieldErrors.location}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="summary">Resumo</Label>
            <textarea
              id="summary"
              name="summary"
              defaultValue={profile.summary ?? ""}
              rows={3}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            {state?.fieldErrors?.summary && (
              <p className="text-sm text-red-600">
                {state.fieldErrors.summary}
              </p>
            )}
          </div>

          {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

          <Button type="submit" disabled={pending} className="self-start">
            {pending ? "Salvando..." : "Salvar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
