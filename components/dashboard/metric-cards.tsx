import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { BriefcaseBusiness, FileText, MessagesSquare, Trophy, UserRound } from "lucide-react";
import type { ReactNode } from "react";

import { Progress } from "@/components/ui/progress";
import { SCORE_BAND_TEXT, scoreBand } from "@/components/ui/score-badge";

function MetricCard({
  href,
  icon: Icon,
  label,
  value,
  children,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  children?: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-surface-elevated"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Icon className="size-4" />
        </span>
      </div>
      <div className="text-3xl font-bold tracking-tight text-foreground tabular-nums">
        {value}
      </div>
      {children}
    </Link>
  );
}

export function MetricCards({
  profile,
  metrics,
}: {
  profile: { percent: number; missing: string[] };
  metrics: {
    jobPostings: number;
    resumes: number;
    interviewsInProgress: number;
    interviewsCompleted: number;
    averageScore: number | null;
  };
}) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      <div className="col-span-2 lg:col-span-1">
        <MetricCard href="/profile" icon={UserRound} label="Perfil" value={`${profile.percent}%`}>
          <Progress value={profile.percent} aria-label="Completude do perfil" />
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {profile.missing.length === 0
              ? "Todas as seções preenchidas."
              : `Falta: ${profile.missing.join(", ")}`}
          </p>
        </MetricCard>
      </div>
      <MetricCard href="/jobs" icon={BriefcaseBusiness} label="Vagas" value={metrics.jobPostings} />
      <MetricCard href="/resumes" icon={FileText} label="Currículos" value={metrics.resumes} />
      <MetricCard
        href="/interviews"
        icon={MessagesSquare}
        label="Entrevistas"
        value={metrics.interviewsInProgress + metrics.interviewsCompleted}
      >
        <p className="text-xs text-muted-foreground">
          {metrics.interviewsInProgress} em andamento · {metrics.interviewsCompleted}{" "}
          {metrics.interviewsCompleted === 1 ? "concluída" : "concluídas"}
        </p>
      </MetricCard>
      <MetricCard
        href="/interviews"
        icon={Trophy}
        label="Nota média"
        value={
          metrics.averageScore === null ? (
            <span className="text-muted-foreground" aria-label="Sem nota ainda">
              —
            </span>
          ) : (
            <span className={SCORE_BAND_TEXT[scoreBand(metrics.averageScore)]}>
              {metrics.averageScore}
            </span>
          )
        }
      >
        <p className="text-xs text-muted-foreground">
          {metrics.averageScore === null ? "Nenhuma análise ainda" : "de 100, nas análises"}
        </p>
      </MetricCard>
    </div>
  );
}
