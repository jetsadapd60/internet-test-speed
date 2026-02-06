"use client";

import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

interface GraphData {
  timestamp: number;
  value: number;
}

interface RealTimeGraphProps {
  data: GraphData[];
  color?: string;
}

export function RealTimeGraph({ data, color = "#0ea5e9" }: RealTimeGraphProps) {
  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%" minHeight={150}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="timestamp" hide />
          <YAxis hide domain={[0, "auto"]} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorValue)"
            animationDuration={300}
            isAnimationActive={true}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
