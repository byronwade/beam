"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAuth } from "@/lib/auth-context";
import { formatDistanceToNow, format, subDays, startOfDay } from "date-fns";
import { Clock, Cable, ArrowRight, Globe } from "lucide-react";
import Link from "next/link";

interface Tunnel {
  _id: string;
  tunnelId: string;
  name: string;
  status: "active" | "inactive" | "pending";
  port: number;
  tunnelType: "quick" | "persistent" | "named";
  lastHeartbeat: number;
  createdAt: number;
}

interface Stats {
  total: number;
  active: number;
  inactive: number;
  pending: number;
}

function generateActivityData(tunnels: Tunnel[] | undefined) {
  const days = 182; // 26 weeks
  const data: { date: Date; count: number }[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = startOfDay(subDays(new Date(), i));
    let count = 0;

    if (tunnels) {
      tunnels.forEach(tunnel => {
        const createdDate = startOfDay(new Date(tunnel.createdAt));
        const heartbeatDate = startOfDay(new Date(tunnel.lastHeartbeat));
        if (createdDate.getTime() === date.getTime() || heartbeatDate.getTime() === date.getTime()) {
          count++;
        }
      });
    }

    data.push({ date, count });
  }

  return data;
}

function ActivityHeatmap({ tunnels }: { tunnels: Tunnel[] | undefined }) {
  const activityData = generateActivityData(tunnels);
  const weeks: { date: Date; count: number }[][] = [];

  for (let i = 0; i < activityData.length; i += 7) {
    weeks.push(activityData.slice(i, i + 7));
  }

  const getIntensity = (count: number) => {
    if (count === 0) return "bg-neutral-100 dark:bg-neutral-800/50";
    if (count === 1) return "bg-emerald-200 dark:bg-emerald-900";
    if (count <= 3) return "bg-emerald-400 dark:bg-emerald-700";
    return "bg-emerald-600 dark:bg-emerald-500";
  };

  const totalEvents = activityData.reduce((sum, d) => sum + d.count, 0);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-neutral-900 dark:text-white">Activity</span>
        <span className="text-xs text-neutral-500">{totalEvents} events in the last 6 months</span>
      </div>
      <div className="flex gap-[3px] overflow-hidden">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-[3px]">
            {week.map((day, dayIndex) => (
              <div
                key={dayIndex}
                className={`h-[10px] w-[10px] rounded-[2px] ${getIntensity(day.count)}`}
                title={`${format(day.date, "MMM d, yyyy")}: ${day.count} events`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const tunnels = useQuery(api.tunnels.list, user?.id ? { userId: user.id } : "skip") as Tunnel[] | undefined;
  const stats = useQuery(api.tunnels.getStats, user?.id ? { userId: user.id } : "skip") as Stats | undefined;

  const isLoading = tunnels === undefined || stats === undefined;

  const tunnelsByDate = tunnels?.reduce((acc, tunnel) => {
    const dateKey = format(new Date(tunnel.lastHeartbeat), "MMMM d, yyyy");
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(tunnel);
    return acc;
  }, {} as Record<string, Tunnel[]>) || {};

  return (
    <div className="flex min-h-[calc(100vh-56px)] pb-24">
      {/* Left Panel */}
      <div className="w-[320px] shrink-0 p-8">
        {/* Avatar */}
        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-rose-400 via-fuchsia-500 to-indigo-500" />

        {/* User Info */}
        <div className="mt-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-white">
            {user?.name || user?.email?.split("@")[0] || "User"}
            <Cable className="h-4 w-4 text-neutral-400" />
          </h2>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-neutral-500">
            <Clock className="h-3.5 w-3.5" />
            {isLoading ? "..." : `${stats?.active || 0} active`}
          </p>
        </div>

        {/* Tags */}
        <div className="mt-5 flex gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
            <Globe className="h-3 w-3" />
            Direct
          </span>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 gap-x-8 gap-y-4">
          <div>
            <p className="text-xs text-neutral-500">First seen</p>
            <p className="mt-1 text-sm font-medium text-neutral-900 dark:text-white">
              {isLoading ? "..." : tunnels && tunnels.length > 0
                ? format(new Date(Math.min(...tunnels.map(t => t.createdAt))), "MMM d, yyyy")
                : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Tunnels</p>
            <p className="mt-1 text-sm font-medium text-neutral-900 dark:text-white">
              {isLoading ? "..." : stats?.total || 0}
            </p>
          </div>
        </div>

        {/* Activity */}
        <div className="mt-8">
          <ActivityHeatmap tunnels={tunnels} />
        </div>
      </div>

      {/* Right Panel - Timeline */}
      <div className="flex-1 p-8">
        {/* Top Icon */}
        <div className="flex justify-end">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
            <Cable className="h-4 w-4 text-neutral-400" />
          </div>
        </div>

        {/* Timeline */}
        {isLoading ? (
          <div className="mt-8 space-y-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex justify-center">
                  <div className="h-6 w-32 rounded-full bg-neutral-100 dark:bg-neutral-800" />
                </div>
                <div className="mt-4 rounded-2xl bg-neutral-50 p-5 dark:bg-neutral-900">
                  <div className="h-4 w-48 rounded bg-neutral-200 dark:bg-neutral-700" />
                </div>
              </div>
            ))}
          </div>
        ) : Object.keys(tunnelsByDate).length > 0 ? (
          <div className="mt-6 space-y-8">
            {Object.entries(tunnelsByDate).map(([date, dateTunnels]) => (
              <div key={date}>
                {/* Date */}
                <div className="flex justify-center">
                  <span className="rounded-full bg-neutral-100 px-4 py-1.5 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                    {date}
                  </span>
                </div>

                {/* Cards */}
                <div className="mt-4 space-y-3">
                  {dateTunnels.map((tunnel) => (
                    <div
                      key={tunnel._id}
                      className="rounded-2xl bg-neutral-50 p-5 dark:bg-neutral-900"
                    >
                      {/* Duration */}
                      <p className="text-xs text-neutral-500">
                        {tunnel.status === "active" ? (
                          <>Tunnel active for <span className="font-medium text-neutral-900 dark:text-white">{formatDistanceToNow(tunnel.lastHeartbeat)}</span></>
                        ) : (
                          <>Session lasted <span className="font-medium text-neutral-900 dark:text-white">{formatDistanceToNow(tunnel.createdAt)}</span></>
                        )}
                      </p>

                      {/* Tunnel Row */}
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${
                            tunnel.status === "active" ? "bg-emerald-500" : "bg-neutral-300 dark:bg-neutral-600"
                          }`} />
                          <span className="text-sm font-medium text-neutral-900 dark:text-white">{tunnel.name}</span>
                        </div>
                        <span className="text-xs text-neutral-500">:{tunnel.port}</span>
                      </div>

                      {/* Footer */}
                      <div className="mt-4 flex items-center justify-between text-xs text-neutral-500">
                        <div className="flex items-center gap-1">
                          <ArrowRight className="h-3 w-3" />
                          <span className="capitalize">{tunnel.tunnelType}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`h-1.5 w-1.5 rounded-full ${tunnel.status === "active" ? "bg-blue-500" : "bg-neutral-300"}`} />
                          <span>{format(new Date(tunnel.lastHeartbeat), "h:mm a")}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-20 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
              <Cable className="h-7 w-7 text-neutral-400" />
            </div>
            <p className="mt-5 text-sm text-neutral-600 dark:text-neutral-400">No tunnels yet</p>
            <p className="mt-1 text-xs text-neutral-400">This is where your tunnel history begins</p>
            <Link
              href="/dashboard/tunnels"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-neutral-900 hover:underline dark:text-white"
            >
              Create your first tunnel
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {/* Bottom */}
        {tunnels && tunnels.length > 0 && (
          <div className="mt-12 flex flex-col items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
              <Cable className="h-5 w-5 text-neutral-400" />
            </div>
            <p className="mt-3 text-xs text-neutral-400">This is where your journey begins</p>
          </div>
        )}
      </div>
    </div>
  );
}
