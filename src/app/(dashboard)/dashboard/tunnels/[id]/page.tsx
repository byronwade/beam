"use client";

import { useQuery, useAction } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { useAuth } from "@/lib/auth-context";
import { useParams, useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";
import {
  ArrowLeft,
  Copy,
  ExternalLink,
  Trash2,
  Loader2,
  Zap,
  Globe,
  Clock,
  Activity,
  Shield,
  AlertTriangle,
  Ban,
  Eye,
  Server,
  Wifi,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Generate mock analytics data
function generateAnalyticsData(days: number) {
  const data = [];
  const now = Date.now();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now - i * 24 * 60 * 60 * 1000);
    data.push({
      date: format(date, "MMM d"),
      requests: Math.floor(Math.random() * 5000) + 500,
      bandwidth: Math.floor(Math.random() * 100) + 10,
      errors: Math.floor(Math.random() * 50),
    });
  }
  return data;
}

function generateSecurityData() {
  return {
    threats: Math.floor(Math.random() * 20),
    blocked: Math.floor(Math.random() * 100),
    challenges: Math.floor(Math.random() * 30),
    countries: [
      { name: "United States", requests: 4521 },
      { name: "Germany", requests: 1234 },
      { name: "United Kingdom", requests: 892 },
      { name: "France", requests: 567 },
      { name: "Other", requests: 1432 },
    ],
  };
}

export default function TunnelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tunnelId = params.id as string;
  const { user } = useAuth();

  const tunnel = useQuery(api.tunnels.getById, { tunnelId });
  const deleteTunnelAction = useAction(api.cloudflareKeys.deleteTunnelAction);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [timeRange, setTimeRange] = useState<"7d" | "30d">("7d");

  const analyticsData = useMemo(
    () => generateAnalyticsData(timeRange === "7d" ? 7 : 30),
    [timeRange]
  );
  const securityData = useMemo(() => generateSecurityData(), []);

  const totalRequests = analyticsData.reduce((sum, d) => sum + d.requests, 0);
  const totalBandwidth = analyticsData.reduce((sum, d) => sum + d.bandwidth, 0);
  const totalErrors = analyticsData.reduce((sum, d) => sum + d.errors, 0);
  const errorRate = totalRequests > 0 ? ((totalErrors / totalRequests) * 100).toFixed(2) : "0";

  const handleDelete = async () => {
    if (!user?.id || !tunnel) return;
    setIsDeleting(true);
    try {
      const result = await deleteTunnelAction({
        userId: user.id,
        tunnelId: tunnel.tunnelId,
      });
      if (result.success) {
        toast.success("Tunnel deleted");
        router.push("/dashboard");
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Failed to delete");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied");
  };

  if (tunnel === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (tunnel === null) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-neutral-500">Tunnel not found</p>
        <Link href="/dashboard" className="text-sm text-neutral-900 hover:underline dark:text-white">
          ← Back to dashboard
        </Link>
      </div>
    );
  }

  const url = tunnel.quickTunnelUrl || tunnel.domain;
  const isActive = tunnel.status === "active";

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <div className="mx-auto max-w-3xl px-4 py-8 pb-24">
        {/* Header */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>

          <div className="mt-6 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
                  {tunnel.name}
                </h1>
                {tunnel.tunnelType === "quick" ? (
                  <Zap className="h-5 w-5 text-amber-500" />
                ) : (
                  <Globe className="h-5 w-5 text-blue-500" />
                )}
              </div>
              {url && (
                <button
                  onClick={() => copyToClipboard(url)}
                  className="mt-2 flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                >
                  {url.replace("https://", "")}
                  <Copy className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {url && (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-neutral-200 p-2 text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-neutral-900 dark:border-neutral-800 dark:hover:bg-neutral-800 dark:hover:text-white"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
              <button
                onClick={() => setDeleteDialogOpen(true)}
                className="rounded-lg border border-red-200 p-2 text-red-500 transition-colors hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Status Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4"
        >
          <div className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  isActive ? "bg-emerald-500" : tunnel.status === "pending" ? "bg-amber-500" : "bg-neutral-300"
                }`}
              />
              <span className="text-sm capitalize text-neutral-500">{tunnel.status}</span>
            </div>
            <p className="mt-2 text-lg font-semibold text-neutral-900 dark:text-white">
              {isActive ? "Live" : "Offline"}
            </p>
          </div>

          <div className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <Server className="h-4 w-4" />
              Port
            </div>
            <p className="mt-2 text-lg font-semibold tabular-nums text-neutral-900 dark:text-white">
              {tunnel.port}
            </p>
          </div>

          <div className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <Clock className="h-4 w-4" />
              Last seen
            </div>
            <p className="mt-2 text-lg font-semibold text-neutral-900 dark:text-white">
              {isActive ? "Now" : formatDistanceToNow(tunnel.lastHeartbeat, { addSuffix: true })}
            </p>
          </div>

          <div className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <Wifi className="h-4 w-4" />
              Type
            </div>
            <p className="mt-2 text-lg font-semibold capitalize text-neutral-900 dark:text-white">
              {tunnel.tunnelType}
            </p>
          </div>
        </motion.div>

        {/* Analytics */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-medium text-neutral-900 dark:text-white">Analytics</h2>
            <div className="flex gap-1 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800">
              {(["7d", "30d"] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                    timeRange === range
                      ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white"
                      : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                  }`}
                >
                  {range === "7d" ? "7 Days" : "30 Days"}
                </button>
              ))}
            </div>
          </div>

          {/* Stats Row */}
          <div className="mb-4 grid grid-cols-4 divide-x divide-neutral-200 rounded-xl border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
            <div className="p-4 text-center">
              <p className="text-xl font-semibold tabular-nums text-neutral-900 dark:text-white">
                {totalRequests.toLocaleString()}
              </p>
              <p className="text-xs text-neutral-500">Requests</p>
            </div>
            <div className="p-4 text-center">
              <p className="text-xl font-semibold tabular-nums text-neutral-900 dark:text-white">
                {totalBandwidth} GB
              </p>
              <p className="text-xs text-neutral-500">Bandwidth</p>
            </div>
            <div className="p-4 text-center">
              <p className="text-xl font-semibold tabular-nums text-neutral-900 dark:text-white">
                {totalErrors.toLocaleString()}
              </p>
              <p className="text-xs text-neutral-500">Errors</p>
            </div>
            <div className="p-4 text-center">
              <p className="text-xl font-semibold tabular-nums text-neutral-900 dark:text-white">
                {errorRate}%
              </p>
              <p className="text-xs text-neutral-500">Error Rate</p>
            </div>
          </div>

          {/* Chart */}
          <div className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
            <p className="mb-4 text-xs text-neutral-500">Requests over time</p>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181b",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Area type="monotone" dataKey="requests" stroke="#10b981" strokeWidth={2} fill="url(#gradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.section>

        {/* Security */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="mb-4 text-sm font-medium text-neutral-900 dark:text-white">Security</h2>

          <div className="mb-4 grid grid-cols-3 gap-4">
            <div className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
              <div className="flex items-center gap-2 text-sm text-neutral-500">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Threats
              </div>
              <p className="mt-2 text-xl font-semibold tabular-nums text-neutral-900 dark:text-white">
                {securityData.threats}
              </p>
            </div>
            <div className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
              <div className="flex items-center gap-2 text-sm text-neutral-500">
                <Ban className="h-4 w-4 text-red-500" />
                Blocked
              </div>
              <p className="mt-2 text-xl font-semibold tabular-nums text-neutral-900 dark:text-white">
                {securityData.blocked}
              </p>
            </div>
            <div className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
              <div className="flex items-center gap-2 text-sm text-neutral-500">
                <Shield className="h-4 w-4 text-blue-500" />
                Challenges
              </div>
              <p className="mt-2 text-xl font-semibold tabular-nums text-neutral-900 dark:text-white">
                {securityData.challenges}
              </p>
            </div>
          </div>

          {/* Top Countries */}
          <div className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
            <p className="mb-4 text-xs text-neutral-500">Top countries by requests</p>
            <div className="space-y-3">
              {securityData.countries.map((country, i) => (
                <div key={country.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-neutral-400">{i + 1}</span>
                    <span className="text-sm text-neutral-900 dark:text-white">{country.name}</span>
                  </div>
                  <span className="text-sm tabular-nums text-neutral-500">
                    {country.requests.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Info */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <h2 className="mb-4 text-sm font-medium text-neutral-900 dark:text-white">Details</h2>
          <div className="divide-y divide-neutral-200 rounded-xl border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
            <div className="flex items-center justify-between p-4">
              <span className="text-sm text-neutral-500">Tunnel ID</span>
              <button
                onClick={() => copyToClipboard(tunnel.tunnelId)}
                className="flex items-center gap-2 font-mono text-sm text-neutral-900 hover:text-neutral-600 dark:text-white"
              >
                {tunnel.tunnelId.slice(0, 16)}...
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex items-center justify-between p-4">
              <span className="text-sm text-neutral-500">Created</span>
              <span className="text-sm text-neutral-900 dark:text-white">
                {format(tunnel.createdAt, "MMM d, yyyy 'at' h:mm a")}
              </span>
            </div>
            <div className="flex items-center justify-between p-4">
              <span className="text-sm text-neutral-500">Type</span>
              <span className="text-sm capitalize text-neutral-900 dark:text-white">
                {tunnel.tunnelType} tunnel
              </span>
            </div>
          </div>
        </motion.section>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete tunnel?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{tunnel.name}&quot;
              {tunnel.tunnelType !== "quick" && " and remove it from Cloudflare"}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
