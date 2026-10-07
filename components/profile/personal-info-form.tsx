"use client";

import { useActionState } from "react";
import { IdCard } from "lucide-react";

import { updatePersonalInfo } from "@/app/(app)/profile/actions";
import type { CandidateProfileModel } from "@/lib/generated/prisma/models";
import { Button } from "@/components/ui/button";
import { SectionTitle } from "@/components/profile/section-title";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
        <SectionTitle icon={IdCard} title="Informações pessoais" />
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
              <p className="text-sm text-destructive">
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
              <p className="text-sm text-destructive">{state.fieldErrors.phone}</p>
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
              <p className="text-sm text-destructive">
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
              className="rounded-lg border border-input bg-input/30 px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
            {state?.fieldErrors?.summary && (
              <p className="text-sm text-destructive">
                {state.fieldErrors.summary}
              </p>
            )}
          </div>

          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

          <Button type="submit" disabled={pending} className="self-start">
            {pending ? "Salvando..." : "Salvar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
