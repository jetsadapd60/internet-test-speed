import React from "react";
import { cn } from "./ui/button";

export function SpeedGauge({
  value = 0,
  max = 100,
  className,
}: {
  value?: number;
  max?: number;
  className?: string;
}) {
  const radius = 80;
  const stroke = 12;
  const normalizedValue = Math.min(Math.max(value, 0), max);
  const percentage = normalizedValue / max;

  // Arc calculation (Semi-circle 180 degrees)
  // Circumference of half circle = PI * r
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference * (1 - percentage);

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center",
        className,
      )}
    >
      <svg
        width="300"
        height="160" // Half height + padding
        viewBox="0 0 200 110"
        className="overflow-visible"
      >
        {/* Defs for Gradient */}
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--primary)" />
            <stop offset="100%" stopColor="var(--accent, #3b82f6)" />
          </linearGradient>
        </defs>

        {/* Background Track */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="var(--secondary)" // visible track
          strokeWidth={stroke}
          strokeLinecap="round"
          className="opacity-20"
        />

        {/* Dynamic Progress Arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-700 ease-out"
        />

        {/* Labels */}
        <text
          x="15"
          y="120"
          className="text-xs fill-muted-foreground font-medium"
          textAnchor="middle"
        >
          0
        </text>
        <text
          x="185"
          y="120"
          className="text-xs fill-muted-foreground font-medium"
          textAnchor="middle"
        >
          {max >= 1000 ? `${max / 1000}k` : max}
        </text>
      </svg>

      {/* Value Display */}
      <div className="absolute bottom-0 text-center mb-2">
        <div className="text-5xl font-bold tracking-tighter text-foreground tabular-nums">
          {Math.round(value)}
        </div>
        <div className="text-sm font-medium text-muted-foreground/80 mt-1">
          Mbps
        </div>
      </div>
    </div>
  );
}
