"use client";

import { motion } from "framer-motion";
import { Activity, Zap, Clock, TrendingUp } from "lucide-react";
import { AnimatedCounter } from "./animated-counter";

interface Stats {
  total: number;
  active: number;
  inactive: number;
  pending: number;
}

interface StatsCardsProps {
  stats: Stats | undefined;
  isLoading: boolean;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.4,
      ease: "easeOut" as const,
    },
  }),
};

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  const cards = [
    {
      label: "Active",
      value: stats?.active ?? 0,
      icon: Activity,
      color: "emerald",
      gradient: "from-emerald-500/10 to-emerald-500/5",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-500",
    },
    {
      label: "Total",
      value: stats?.total ?? 0,
      icon: Zap,
      color: "blue",
      gradient: "from-blue-500/10 to-blue-500/5",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-500",
    },
    {
      label: "Pending",
      value: stats?.pending ?? 0,
      icon: Clock,
      color: "amber",
      gradient: "from-amber-500/10 to-amber-500/5",
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-500",
    },
    {
      label: "Uptime",
      value: 99,
      suffix: "%",
      icon: TrendingUp,
      color: "violet",
      gradient: "from-violet-500/10 to-violet-500/5",
      iconBg: "bg-violet-500/10",
      iconColor: "text-violet-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          custom={i}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover={{ scale: 1.02, y: -2 }}
          className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.gradient} p-4 transition-shadow hover:shadow-lg`}
        >
          {/* Background decoration */}
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br from-white/10 to-transparent blur-2xl" />

          <div className="relative">
            <div className={`mb-3 inline-flex rounded-xl ${card.iconBg} p-2.5`}>
              <card.icon className={`h-4 w-4 ${card.iconColor}`} />
            </div>

            <div className="flex items-baseline gap-1">
              {isLoading ? (
                <div className="h-8 w-12 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
              ) : (
                <>
                  <AnimatedCounter
                    value={card.value}
                    className="text-2xl font-bold text-neutral-900 dark:text-neutral-100"
                  />
                  {card.suffix && (
                    <span className="text-lg font-medium text-neutral-500">{card.suffix}</span>
                  )}
                </>
              )}
            </div>

            <p className="mt-1 text-sm text-neutral-500">{card.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
