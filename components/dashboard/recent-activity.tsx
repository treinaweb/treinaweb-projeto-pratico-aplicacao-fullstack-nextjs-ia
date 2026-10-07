import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { BriefcaseBusiness, CircleCheck, FileText, MessagesSquare, Sparkles } from "lucide-react";

import type { ActivityEvent } from "@/lib/dashboard/metrics";

const KIND: Record<ActivityEvent["kind"], { label: string; icon: LucideIcon }> = {
  "job-saved": { label: "Vaga salva", icon: BriefcaseBusiness },
  "resume-generated": { label: "Currículo gerado", icon: FileText },
  "interview-started": { label: "Entrevista iniciada", icon: MessagesSquare },
  "interview-completed": { label: "Entrevista concluída", icon: CircleCheck },
  "analysis-generated": { label: "Análise gerada", icon: Sparkles },
};

const relative = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });

function timeAgo(date: Date, now: Date) {
  const minutes = Math.round((date.getTime() - now.getTime()) / 60000);
  if (Math.abs(minutes) < 60) return relative.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return relative.format(hours, "hour");
  return relative.format(Math.round(hours / 24), "day");
}

export function RecentActivity({ events, now }: { events: ActivityEvent[]; now: Date }) {
  return (
    <ul className="flex flex-col">
      {events.map((event, index) => {
        const { label, icon: Icon } = KIND[event.kind];
        return (
          <li key={`${event.kind}-${event.href}-${index}`}>
            <Link
              href={event.href}
              className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-surface-elevated"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-primary ring-1 ring-border">
                <Icon className="size-4" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-sm font-medium text-foreground">{label}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {event.company ? `${event.title} · ${event.company}` : event.title}
                </span>
              </span>
              <time
                dateTime={event.date.toISOString()}
                className="shrink-0 text-xs text-muted-foreground"
              >
                {timeAgo(event.date, now)}
              </time>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
