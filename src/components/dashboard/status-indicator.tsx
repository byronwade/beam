"use client";

import { motion } from "framer-motion";

interface StatusIndicatorProps {
  status: "active" | "inactive" | "pending";
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: { dot: "h-2 w-2", ring: "h-4 w-4" },
  md: { dot: "h-2.5 w-2.5", ring: "h-5 w-5" },
  lg: { dot: "h-3 w-3", ring: "h-6 w-6" },
};

const statusColors = {
  active: {
    dot: "bg-emerald-500",
    ring: "border-emerald-500/50",
    glow: "shadow-emerald-500/50",
  },
  pending: {
    dot: "bg-amber-500",
    ring: "border-amber-500/50",
    glow: "shadow-amber-500/50",
  },
  inactive: {
    dot: "bg-neutral-400 dark:bg-neutral-600",
    ring: "border-neutral-400/50 dark:border-neutral-600/50",
    glow: "",
  },
};

export function StatusIndicator({ status, size = "md" }: StatusIndicatorProps) {
  const sizes = sizeClasses[size];
  const colors = statusColors[status];
  const isAnimated = status === "active" || status === "pending";

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer pulsing ring for active/pending */}
      {isAnimated && (
        <motion.div
          className={`absolute rounded-full border-2 ${sizes.ring} ${colors.ring}`}
          initial={{ scale: 1, opacity: 0.8 }}
          animate={{
            scale: [1, 1.8, 1.8],
            opacity: [0.8, 0, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      )}

      {/* Second ring for more depth */}
      {status === "active" && (
        <motion.div
          className={`absolute rounded-full border-2 ${sizes.ring} ${colors.ring}`}
          initial={{ scale: 1, opacity: 0.6 }}
          animate={{
            scale: [1, 1.5, 1.5],
            opacity: [0.6, 0, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut",
            delay: 0.5,
          }}
        />
      )}

      {/* Core dot with subtle pulse */}
      <motion.div
        className={`relative rounded-full ${sizes.dot} ${colors.dot} ${
          status === "active" ? `shadow-lg ${colors.glow}` : ""
        }`}
        animate={
          isAnimated
            ? {
                scale: [1, 1.1, 1],
              }
            : {}
        }
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
