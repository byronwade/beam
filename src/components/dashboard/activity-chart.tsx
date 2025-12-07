"use client";

import { useState, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

type TimeRange = "24h" | "7d" | "30d";

interface ActivityChartProps {
  activeTunnels: number;
}

function generateMockData(range: TimeRange, activeTunnels: number) {
  const now = Date.now();
  const points: { time: string; value: number }[] = [];

  let intervals: number;
  let intervalMs: number;
  let formatTime: (date: Date) => string;

  switch (range) {
    case "24h":
      intervals = 24;
      intervalMs = 60 * 60 * 1000;
      formatTime = (d) => d.getHours().toString().padStart(2, "0") + ":00";
      break;
    case "7d":
      intervals = 7;
      intervalMs = 24 * 60 * 60 * 1000;
      formatTime = (d) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
      break;
    case "30d":
      intervals = 30;
      intervalMs = 24 * 60 * 60 * 1000;
      formatTime = (d) => `${d.getMonth() + 1}/${d.getDate()}`;
      break;
  }

  const baseValue = activeTunnels * 100;

  for (let i = intervals - 1; i >= 0; i--) {
    const timestamp = now - i * intervalMs;
    const date = new Date(timestamp);
    const variation = 0.5 + Math.random();
    points.push({
      time: formatTime(date),
      value: activeTunnels > 0 ? Math.round(baseValue * variation) : 0,
    });
  }

  return points;
}

export function ActivityChart({ activeTunnels }: ActivityChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("24h");
  const data = useMemo(() => generateMockData(timeRange, activeTunnels), [timeRange, activeTunnels]);
  const total = data.reduce((sum, d) => sum + d.value, 0);

  const ranges: { value: TimeRange; label: string }[] = [
    { value: "24h", label: "24H" },
    { value: "7d", label: "7D" },
    { value: "30d", label: "30D" },
  ];

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-neutral-500">Requests</p>
          <p className="text-2xl font-semibold tabular-nums text-neutral-900 dark:text-white">
            {total.toLocaleString()}
          </p>
        </div>
        <div className="flex gap-1 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800">
          {ranges.map((range) => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value)}
              className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                timeRange === range.value
                  ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[180px]">
        {activeTunnels === 0 ? (
          <div className="flex h-full items-center justify-center text-neutral-400">
            <p className="text-sm">No activity yet</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="time"
                tick={{ fontSize: 12, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#gradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
