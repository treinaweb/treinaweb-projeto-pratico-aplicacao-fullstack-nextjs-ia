"use client";

import { Bar, BarChart, Cell, LabelList, XAxis, YAxis } from "recharts";

import type { CriterionAverage } from "@/lib/dashboard/metrics";
import { type ChartConfig, ChartContainer } from "@/components/ui/chart";

const chartConfig = {
  value: { label: "Média", color: "var(--chart-1)" },
  weakest: { label: "Foco do próximo treino", color: "var(--chart-3)" },
} satisfies ChartConfig;

export function CriteriaChart({
  averages,
  weakestKey,
}: {
  averages: CriterionAverage[];
  weakestKey: string;
}) {
  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-56 w-full">
      <BarChart
        data={averages}
        layout="vertical"
        margin={{ top: 0, right: 36, left: 0, bottom: 0 }}
        barCategoryGap={10}
      >
        <XAxis type="number" domain={[0, 100]} hide />
        <YAxis
          type="category"
          dataKey="label"
          width={150}
          tickLine={false}
          axisLine={false}
        />
        <Bar dataKey="value" radius={6} background={{ fill: "var(--muted)", radius: 6 }}>
          {averages.map((item) => (
            <Cell
              key={item.key}
              fill={item.key === weakestKey ? "var(--color-weakest)" : "var(--color-value)"}
              fillOpacity={item.key === weakestKey ? 1 : 0.85}
            />
          ))}
          <LabelList
            dataKey="value"
            position="right"
            className="fill-foreground font-semibold tabular-nums"
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
