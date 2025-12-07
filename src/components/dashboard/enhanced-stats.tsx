"use client";

import { motion } from "framer-motion";
import { Activity, Server, Clock, TrendingUp } from "lucide-react";

interface Stats {
  total: number;
  active: number;
  inactive: number;
  pending: number;
}

interface EnhancedStatsProps {
  stats: Stats | undefined;
  isLoading: boolean;
}

export function EnhancedStats({ stats, isLoading }: EnhancedStatsProps) {
  const metrics = [
    { label: "Active", value: stats?.active ?? 0, icon: Activity },
    { label: "Total", value: stats?.total ?? 0, icon: Server },
    { label: "Pending", value: stats?.pending ?? 0, icon: Clock },
    { label: "Uptime", value: "99.9%", icon: TrendingUp },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {metrics.map((metric, i) => (
        <motion.div
          key={metric.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="group"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
              <metric.icon className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
            </div>
            <div>
              {isLoading ? (
                <div className="h-7 w-12 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
              ) : (
                <p className="text-2xl font-semibold tabular-nums text-neutral-900 dark:text-white">
                  {metric.value}
                </p>
              )}
              <p className="text-sm text-neutral-500">{metric.label}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
