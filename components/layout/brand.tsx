import { BriefcaseBusiness } from "lucide-react";
import { cn } from "cn";

// Text wordmark; the TreinaWeb logo itself is not reused.
export function Brand({
  className,
  hideText = false,
}: {
  className?: string;
  hideText?: boolean;
}) {
  return (
    <span className={cn("flex items-center gap-2 font-bold tracking-tight", className)}>
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/30">
        <BriefcaseBusiness className="size-4" />
      </span>
      {!hideText && (
        <span className="truncate text-foreground">
          TWJobs <span className="text-primary">AI</span>
        </span>
      )}
    </span>
  );
}
