"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Zap, Globe, Copy, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
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

type FilterTab = "all" | "active" | "quick" | "persistent";

interface TunnelsSectionProps {
  tunnels: Tunnel[] | undefined;
  isLoading: boolean;
  deletingId: string | null;
  onDeleteClick: (tunnel: Tunnel) => void;
}

export function TunnelsSection({
  tunnels,
  isLoading,
  deletingId,
  onDeleteClick,
}: TunnelsSectionProps) {
  const [filter, setFilter] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");

  const filteredTunnels = useMemo(() => {
    if (!tunnels) return [];
    let result = tunnels;

    if (filter === "active") result = result.filter((t) => t.status === "active");
    else if (filter === "quick") result = result.filter((t) => t.tunnelType === "quick");
    else if (filter === "persistent") result = result.filter((t) => t.tunnelType !== "quick");

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.quickTunnelUrl?.toLowerCase().includes(q) ||
          t.port.toString().includes(q)
      );
    }

    return result;
  }, [tunnels, filter, search]);

  const counts = useMemo(() => {
    if (!tunnels) return { all: 0, active: 0, quick: 0, persistent: 0 };
    return {
      all: tunnels.length,
      active: tunnels.filter((t) => t.status === "active").length,
      quick: tunnels.filter((t) => t.tunnelType === "quick").length,
      persistent: tunnels.filter((t) => t.tunnelType !== "quick").length,
    };
  }, [tunnels]);

  const tabs: { value: FilterTab; label: string }[] = [
    { value: "all", label: "All" },
    { value: "active", label: "Active" },
    { value: "quick", label: "Quick" },
    { value: "persistent", label: "Persistent" },
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied");
  };

  return (
    <div className="rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      {/* Header */}
      <div className="border-b border-neutral-200 p-4 dark:border-neutral-800">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  filter === tab.value
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                {tab.label}
                {counts[tab.value] > 0 && (
                  <span className="ml-1.5 text-xs opacity-60">{counts[tab.value]}</span>
                )}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-lg border border-neutral-200 bg-transparent pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-neutral-400 focus:border-neutral-400 dark:border-neutral-700 dark:focus:border-neutral-500 sm:w-[200px]"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="p-8 text-center">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-neutral-400" />
          </div>
        ) : filteredTunnels.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-sm text-neutral-500 dark:border-neutral-800">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">URL</th>
                <th className="px-4 py-3 font-medium">Port</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Last Seen</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {filteredTunnels.map((tunnel) => {
                  const url = tunnel.quickTunnelUrl || tunnel.domain;
                  const isActive = tunnel.status === "active";
                  return (
                    <motion.tr
                      key={tunnel._id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="group border-b border-neutral-100 last:border-0 dark:border-neutral-800"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-neutral-900 dark:text-white">
                            {tunnel.name}
                          </span>
                          {tunnel.tunnelType === "quick" && (
                            <Zap className="h-3.5 w-3.5 text-amber-500" />
                          )}
                          {tunnel.tunnelType !== "quick" && (
                            <Globe className="h-3.5 w-3.5 text-blue-500" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {url ? (
                          <button
                            onClick={() => copyToClipboard(url)}
                            className="group/url flex items-center gap-1.5 text-sm text-neutral-500 transition-colors hover:text-neutral-900 dark:hover:text-white"
                          >
                            <span className="max-w-[200px] truncate">
                              {url.replace("https://", "")}
                            </span>
                            <Copy className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover/url:opacity-100" />
                          </button>
                        ) : (
                          <span className="text-sm text-neutral-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm text-neutral-600 dark:text-neutral-400">
                          {tunnel.port}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              isActive
                                ? "bg-emerald-500"
                                : tunnel.status === "pending"
                                ? "bg-amber-500"
                                : "bg-neutral-300 dark:bg-neutral-600"
                            }`}
                          />
                          <span className="text-sm capitalize text-neutral-600 dark:text-neutral-400">
                            {tunnel.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-neutral-500">
                          {isActive
                            ? "Now"
                            : formatDistanceToNow(tunnel.lastHeartbeat, { addSuffix: true })}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          {url && (
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                          <button
                            onClick={() => onDeleteClick(tunnel)}
                            disabled={deletingId === tunnel.tunnelId}
                            className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950"
                          >
                            {deletingId === tunnel.tunnelId ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center">
            <p className="text-sm text-neutral-500">
              {search ? "No tunnels match your search" : "No tunnels yet"}
            </p>
            {!search && (
              <p className="mt-1 text-xs text-neutral-400">
                Run <code className="rounded bg-neutral-100 px-1.5 py-0.5 dark:bg-neutral-800">beam quick 3000</code>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
