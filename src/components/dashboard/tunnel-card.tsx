"use client";

import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { Copy, Trash2, Loader2, ExternalLink, Globe, Zap } from "lucide-react";
import { StatusIndicator } from "./status-indicator";
import { ActivitySparkline } from "./activity-sparkline";
import { toast } from "sonner";

interface Tunnel {
  _id: string;
  tunnelId: string;
  name: string;
  status: "active" | "inactive" | "pending";
  port: number;
  tunnelType: "quick" | "persistent" | "named";
  quickTunnelUrl?: string;
  domain?: string;
  lastHeartbeat: number;
  createdAt: number;
}

interface TunnelCardProps {
  tunnel: Tunnel;
  onDelete: () => void;
  isDeleting: boolean;
  index: number;
}

export function TunnelCard({ tunnel, onDelete, isDeleting, index }: TunnelCardProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const isActive = tunnel.status === "active";
  const displayUrl = tunnel.quickTunnelUrl || tunnel.domain;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{
        duration: 0.3,
        delay: index * 0.05,
        layout: { duration: 0.2 },
      }}
      whileHover={{ scale: 1.01 }}
      className="group relative"
    >
      {/* Glow effect for active tunnels */}
      {isActive && (
        <motion.div
          className="absolute -inset-px rounded-2xl bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-emerald-500/20 opacity-0 blur-sm transition-opacity group-hover:opacity-100"
          initial={false}
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      )}

      <div
        className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${
          isActive
            ? "border-emerald-500/20 bg-white dark:bg-neutral-900"
            : "border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
        }`}
      >
        {/* Active indicator bar */}
        {isActive && (
          <motion.div
            className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-emerald-400 to-emerald-600"
            layoutId={`indicator-${tunnel._id}`}
          />
        )}

        <div className="flex items-center justify-between p-4 pl-5">
          <div className="flex items-center gap-4">
            {/* Status indicator */}
            <StatusIndicator status={tunnel.status} size="md" />

            {/* Tunnel info */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {tunnel.name}
                </span>
                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                  :{tunnel.port}
                </span>
                {tunnel.tunnelType === "quick" && (
                  <Zap className="h-3.5 w-3.5 text-amber-500" />
                )}
              </div>

              {displayUrl && (
                <motion.button
                  onClick={() => copyToClipboard(displayUrl)}
                  className="mt-1 flex items-center gap-1.5 text-sm text-emerald-600 transition-colors hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Globe className="h-3.5 w-3.5" />
                  <span className="truncate max-w-[200px] sm:max-w-[300px]">
                    {displayUrl.replace("https://", "")}
                  </span>
                  <Copy className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                </motion.button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Activity sparkline */}
            <div className="hidden sm:block">
              <ActivitySparkline isActive={isActive} />
            </div>

            {/* Last seen */}
            <div className="text-right">
              <span className="text-xs text-neutral-400">
                {isActive ? "Live" : formatDistanceToNow(tunnel.lastHeartbeat, { addSuffix: true })}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {displayUrl && (
                <motion.a
                  href={displayUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg p-2 text-neutral-400 opacity-0 transition-all hover:bg-neutral-100 hover:text-neutral-600 group-hover:opacity-100 dark:hover:bg-neutral-800"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ExternalLink className="h-4 w-4" />
                </motion.a>
              )}

              <motion.button
                onClick={onDelete}
                disabled={isDeleting}
                className="rounded-lg p-2 text-neutral-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 dark:hover:bg-red-950"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
