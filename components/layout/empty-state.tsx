import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-input bg-card/50 px-6 py-12 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary ring-1 ring-primary/30">
        <Icon className="size-5" />
      </span>
      <div className="flex max-w-md flex-col gap-1">
        <p className="font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}
