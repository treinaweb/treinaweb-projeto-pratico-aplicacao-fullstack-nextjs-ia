import type { LucideIcon } from "lucide-react";

import { CardTitle } from "@/components/ui/card";

export function SectionTitle({
  icon: Icon,
  title,
  count,
}: {
  icon: LucideIcon;
  title: string;
  count?: number;
}) {
  return (
    <CardTitle className="flex items-center gap-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
        <Icon className="size-4" />
      </span>
      <span className="flex-1">{title}</span>
      {count !== undefined && (
        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground ring-1 ring-border">
          {count} {count === 1 ? "item" : "itens"}
        </span>
      )}
    </CardTitle>
  );
}
