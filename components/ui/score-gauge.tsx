"use client";

interface ScoreGaugeProps {
  score: number; // 0-5
  size?: number;
}

export function ScoreGauge({ score, size = 48 }: ScoreGaugeProps) {
  // Normalize score to 0-100 for the gauge
  const percentage = Math.min(Math.max(score * 20, 0), 100);
  const color = getScoreColor(score);

  // SVG circle parameters
  const strokeWidth = size * 0.18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const center = size / 2;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        {/* Background circle — dark mode compatible */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted-foreground/15"
        />
        {/* Progress circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{
            transition: "stroke-dashoffset 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />
      </svg>
      <span className="absolute text-[10px] font-bold tabular-nums" style={{ color }}>
        {score.toFixed(1)}
      </span>
    </div>
  );
}

function getScoreColor(score: number): string {
  // Use theme chart tokens so colors adapt if the palette changes.
  if (score >= 4.5) return "var(--chart-2)";   // green
  if (score >= 3.5) return "var(--chart-1)";   // blue
  if (score >= 2.5) return "var(--chart-5)";   // amber
  return "var(--chart-3)";                     // red
}
