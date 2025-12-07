"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

interface ActivitySparklineProps {
  isActive: boolean;
  className?: string;
}

// Generate fake activity data that looks realistic
function generateActivityData(isActive: boolean) {
  const points = 20;
  const data = [];
  let value = isActive ? 50 : 10;

  for (let i = 0; i < points; i++) {
    if (isActive) {
      // Active: fluctuating traffic pattern
      const noise = (Math.random() - 0.5) * 30;
      const trend = Math.sin(i / 3) * 20;
      value = Math.max(10, Math.min(100, value + noise + trend * 0.3));
    } else {
      // Inactive: flatline with occasional tiny blips
      value = Math.random() > 0.9 ? 5 + Math.random() * 10 : 2;
    }
    data.push({ value: Math.round(value), index: i });
  }

  return data;
}

export function ActivitySparkline({ isActive, className = "" }: ActivitySparklineProps) {
  const data = useMemo(() => generateActivityData(isActive), [isActive]);

  return (
    <motion.div
      className={`h-8 w-24 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
          <defs>
            <linearGradient id="sparklineGradientActive" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="sparklineGradientInactive" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#737373" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#737373" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={isActive ? "#10b981" : "#737373"}
            strokeWidth={1.5}
            fill={isActive ? "url(#sparklineGradientActive)" : "url(#sparklineGradientInactive)"}
            isAnimationActive={true}
            animationDuration={1000}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
