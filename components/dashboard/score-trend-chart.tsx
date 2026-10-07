"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import type { ScoreTrendPoint } from "@/lib/dashboard/metrics";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  score: { label: "Nota", color: "var(--chart-1)" },
} satisfies ChartConfig;

const shortDate = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" });
const longDate = new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" });

export function ScoreTrendChart({ points }: { points: ScoreTrendPoint[] }) {
  const data = points.map((point, index) => ({ ...point, index: index + 1 }));

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
      <LineChart data={data} margin={{ top: 12, right: 12, left: -16, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="index"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(index: number) => shortDate.format(new Date(data[index - 1].date))}
        />
        <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickLine={false} axisLine={false} />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              labelFormatter={(_, payload) => {
                const point = payload?.[0]?.payload as (typeof data)[number] | undefined;
                if (!point) return null;
                return (
                  <div className="flex flex-col">
                    <span>{point.company ? `${point.title} · ${point.company}` : point.title}</span>
                    <span className="font-normal text-muted-foreground">
                      {longDate.format(new Date(point.date))}
                    </span>
                  </div>
                );
              }}
            />
          }
        />
        <Line
          dataKey="score"
          type="monotone"
          stroke="var(--color-score)"
          strokeWidth={2.5}
          dot={{ r: 4, fill: "var(--color-score)" }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ChartContainer>
  );
}
