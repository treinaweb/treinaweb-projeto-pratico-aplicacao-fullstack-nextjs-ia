import { CircleAlert, CircleCheck, CircleMinus } from "lucide-react";
import { cn } from "cn";

// Score bands shared by the dashboard, the interviews list, and the analysis.
// Good scores use green text only: a full green fill is reserved for CTAs.
export type ScoreBand = "good" | "medium" | "low";

export function scoreBand(score: number): ScoreBand {
  if (score >= 75) return "good";
  if (score >= 50) return "medium";
  return "low";
}

export const SCORE_BAND_TEXT: Record<ScoreBand, string> = {
  good: "text-cta",
  medium: "text-amber-400",
  low: "text-destructive",
};

export const SCORE_BAND_FILL: Record<ScoreBand, string> = {
  good: "bg-cta",
  medium: "bg-amber-400",
  low: "bg-destructive",
};

const ICONS = { good: CircleCheck, medium: CircleMinus, low: CircleAlert };
const LABELS = { good: "boa", medium: "média", low: "baixa" };

export function ScoreBadge({
  score,
  prefix = "Nota",
  className,
}: {
  score: number;
  prefix?: string;
  className?: string;
}) {
  const band = scoreBand(score);
  const Icon = ICONS[band];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-current/30 px-2 py-0.5 text-xs font-semibold tabular-nums",
        SCORE_BAND_TEXT[band],
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      {prefix && `${prefix} `}
      {score}
      <span className="sr-only">(faixa {LABELS[band]})</span>
    </span>
  );
}
