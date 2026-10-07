import { Target } from "lucide-react";

import { requireSession } from "@/lib/auth/session";
import { getDashboardSummary } from "@/lib/dashboard/summary";
import {
  computeMetrics,
  criterionAverages,
  onboardingSteps,
  recentActivity,
  scoreTrend,
} from "@/lib/dashboard/metrics";
import { computeNextStep } from "@/lib/dashboard/next-step";
import { computeProfileCompleteness } from "@/lib/dashboard/profile";
import { CriteriaChart } from "@/components/dashboard/criteria-chart";
import { MetricCards } from "@/components/dashboard/metric-cards";
import { NextStepCard } from "@/components/dashboard/next-step-card";
import { OnboardingChecklist } from "@/components/dashboard/onboarding-checklist";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { ScoreTrendChart } from "@/components/dashboard/score-trend-chart";
import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScoreBadge } from "@/components/ui/score-badge";

const longDate = new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" });

export default async function DashboardPage() {
  const session = await requireSession();
  const summary = await getDashboardSummary(session.user.id);
  const firstName = session.user.name.split(" ")[0];

  const nextStep = computeNextStep(summary);
  const metrics = computeMetrics(summary);
  const trend = scoreTrend(summary);
  const criteria = criterionAverages(summary);
  const activity = recentActivity(summary);
  const onboarding = metrics.analysisCount === 0;
  const hasSideColumn = criteria !== null || activity.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Olá, ${firstName}`}
        description="Acompanhe sua preparação e siga para o próximo passo."
      />

      <NextStepCard step={nextStep} />

      <MetricCards
        profile={computeProfileCompleteness(summary)}
        metrics={metrics}
      />

      <div className="grid gap-6 lg:grid-cols-5 lg:items-start">
        <Card className={hasSideColumn ? "lg:col-span-3" : "lg:col-span-5"}>
          {onboarding ? (
            <>
              <CardHeader>
                <CardTitle>Comece por aqui</CardTitle>
                <CardDescription>
                  A jornada até a sua primeira análise.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OnboardingChecklist steps={onboardingSteps(summary)} />
              </CardContent>
            </>
          ) : trend.length >= 2 ? (
            <>
              <CardHeader>
                <CardTitle>Evolução das notas</CardTitle>
                <CardDescription>
                  Nota geral de cada entrevista analisada, da mais antiga para a
                  mais recente.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScoreTrendChart points={trend} />
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader>
                <CardTitle>Sua primeira nota</CardTitle>
                <CardDescription>
                  Com a próxima análise, você passa a ver a evolução das notas
                  aqui.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-start gap-3">
                <p className="text-6xl font-bold tracking-tight tabular-nums text-foreground">
                  {trend[0].score}
                  <span className="text-xl font-normal text-muted-foreground">
                    /100
                  </span>
                </p>
                <ScoreBadge score={trend[0].score} />
                <p className="text-sm text-muted-foreground">
                  {trend[0].company
                    ? `${trend[0].title} · ${trend[0].company}`
                    : trend[0].title}{" "}
                  · {longDate.format(new Date(trend[0].date))}
                </p>
              </CardContent>
            </>
          )}
        </Card>

        {hasSideColumn && (
          <div className="flex flex-col gap-6 lg:col-span-2">
            {criteria && (
              <Card>
                <CardHeader>
                  <CardTitle>Critérios</CardTitle>
                  <CardDescription>
                    Média de cada critério nas suas análises.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <CriteriaChart
                    averages={criteria.averages}
                    weakestKey={criteria.weakest.key}
                  />
                  <p className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm text-body">
                    <Target className="size-4 shrink-0 text-chart-3" />
                    <span>
                      Foco do próximo treino:{" "}
                      <strong className="text-foreground">
                        {criteria.weakest.label} ({criteria.weakest.value})
                      </strong>
                    </span>
                  </p>
                </CardContent>
              </Card>
            )}

            {activity.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Atividade recente</CardTitle>
                </CardHeader>
                <CardContent>
                  <RecentActivity events={activity} now={new Date()} />
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
