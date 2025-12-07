"use client";

import { useQuery, useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAuth } from "@/lib/auth-context";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  Activity,
  Server,
  Clock,
  TrendingUp,
  Zap,
  Globe,
  Copy,
  Trash2,
  ExternalLink,
  Loader2,
  ChevronRight,
  Terminal,
  Globe2,
  Shield,
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

interface Stats {
  total: number;
  active: number;
  inactive: number;
  pending: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const tunnels = useQuery(api.tunnels.list, user?.id ? { userId: user.id } : "skip") as Tunnel[] | undefined;
  const stats = useQuery(api.tunnels.getStats, user?.id ? { userId: user.id } : "skip") as Stats | undefined;
  const subdomains = useQuery(api.subdomains.listByUser, user?.id ? { userId: user.id } : "skip");
  const hasCloudflareKey = useQuery(api.tunnels.hasCloudflareKey, user?.id ? { userId: user.id } : "skip");
  const deleteTunnelAction = useAction(api.cloudflareKeys.deleteTunnelAction);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tunnelToDelete, setTunnelToDelete] = useState<Tunnel | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [greeting, setGreeting] = useState("Welcome");

  const isLoading = tunnels === undefined || stats === undefined;

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  const handleDelete = async () => {
    if (!user?.id || !tunnelToDelete) return;
    setDeletingId(tunnelToDelete.tunnelId);
    try {
      const result = await deleteTunnelAction({
        userId: user.id,
        tunnelId: tunnelToDelete.tunnelId,
      });
      if (result.success) {
        toast.success("Tunnel deleted");
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeletingId(null);
      setDeleteDialogOpen(false);
      setTunnelToDelete(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied");
  };

  const activeTunnels = stats?.active ?? 0;

  const metrics = [
    { label: "Active", value: stats?.active ?? 0, icon: Activity, color: "text-emerald-500" },
    { label: "Total", value: stats?.total ?? 0, icon: Server, color: "text-blue-500" },
    { label: "Pending", value: stats?.pending ?? 0, icon: Clock, color: "text-amber-500" },
    { label: "Uptime", value: "99.9%", icon: TrendingUp, color: "text-violet-500" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-12 pb-24">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-12 text-center"
        >
          <h1 className="text-2xl font-semibold text-foreground">
            {greeting}, <span className="text-beam-rainbow">{user?.name || user?.email?.split("@")[0] || "there"}</span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            {isLoading
              ? "Loading your dashboard..."
              : activeTunnels > 0
              ? `${activeTunnels} tunnel${activeTunnels > 1 ? "s" : ""} running`
              : "No active tunnels"}
          </p>
        </motion.header>

        {/* Stats - with rainbow top line */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <div className="grid grid-cols-4 divide-x divide-border rounded-2xl border border-border bg-card overflow-hidden rainbow-top-line">
            {metrics.map((metric, index) => (
              <div key={metric.label} className="px-4 py-6 text-center">
                {isLoading ? (
                  <div className="mx-auto h-8 w-12 animate-pulse rounded bg-muted" />
                ) : (
                  <p className={`text-2xl font-semibold tabular-nums ${index === 0 ? "text-beam-rainbow" : "text-foreground"}`}>
                    {metric.value}
                  </p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">{metric.label}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Quick Start */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-foreground">Quick Start</h2>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              { cmd: "beam login", desc: "Authenticate CLI" },
              { cmd: "beam 3000", desc: "Start quick tunnel" },
            ].map((item) => (
              <button
                key={item.cmd}
                onClick={() => copyToClipboard(item.cmd)}
                className="group flex items-center justify-between rounded-xl border border-border bg-card p-4 text-left transition-all hover-rainbow-border"
              >
                <div>
                  <code className="font-mono text-sm text-foreground">{item.cmd}</code>
                  <p className="mt-0.5 text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Copy className="h-4 w-4 text-muted-foreground/50 transition-colors group-hover:text-muted-foreground" />
              </button>
            ))}
          </div>
        </motion.section>

        {/* Tunnels */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-foreground">Tunnels</h2>
            <span className="text-xs text-muted-foreground">{tunnels?.length ?? 0} total</span>
          </div>

          {isLoading ? (
            <div className="rounded-2xl border border-border p-8 text-center">
              <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : tunnels && tunnels.length > 0 ? (
            <div className="divide-y divide-border rounded-2xl border border-border bg-card overflow-hidden">
              {tunnels.slice(0, 5).map((tunnel) => {
                const url = tunnel.quickTunnelUrl || tunnel.domain;
                const isActive = tunnel.status === "active";
                return (
                  <div key={tunnel._id} className="group flex items-center justify-between p-4 hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Rainbow status indicator for active tunnels */}
                      {isActive ? (
                        <span className="relative h-2.5 w-2.5 rounded-full bg-[linear-gradient(135deg,#FF0000,#00FF00,#0000FF)]">
                          <span className="absolute inset-0 rounded-full bg-[linear-gradient(135deg,#FF0000,#00FF00,#0000FF)] animate-ping opacity-75" />
                        </span>
                      ) : (
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${
                            tunnel.status === "pending"
                              ? "bg-amber-500"
                              : "bg-muted-foreground/30"
                          }`}
                        />
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/dashboard/tunnels/${tunnel.tunnelId}`}
                            className="font-medium text-foreground hover:underline"
                          >
                            {tunnel.name}
                          </Link>
                          {tunnel.tunnelType === "quick" ? (
                            <Zap className="h-3.5 w-3.5 text-amber-500" />
                          ) : (
                            <Globe className="h-3.5 w-3.5 text-blue-500" />
                          )}
                          <span className="text-xs text-muted-foreground">:{tunnel.port}</span>
                        </div>
                        {url && (
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            {url.replace("https://", "")}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${isActive ? "text-beam-rainbow" : "text-muted-foreground"}`}>
                        {isActive ? "Live" : formatDistanceToNow(tunnel.lastHeartbeat, { addSuffix: true })}
                      </span>
                      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        {url && (
                          <>
                            <button
                              onClick={() => copyToClipboard(url)}
                              className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          </>
                        )}
                        <button
                          onClick={() => {
                            setTunnelToDelete(tunnel);
                            setDeleteDialogOpen(true);
                          }}
                          disabled={deletingId === tunnel.tunnelId}
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        >
                          {deletingId === tunnel.tunnelId ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                      <Link
                        href={`/dashboard/tunnels/${tunnel.tunnelId}`}
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
              {tunnels.length > 5 && (
                <Link
                  href="/dashboard/tunnels"
                  className="flex items-center justify-center gap-2 p-4 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  View all {tunnels.length} tunnels
                  <ChevronRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center hover-rainbow-border">
              <Terminal className="mx-auto h-8 w-8 text-muted-foreground/50" />
              <p className="mt-3 text-sm text-muted-foreground">No tunnels yet</p>
              <p className="mt-1 text-xs text-muted-foreground/70">
                Run <code className="rounded bg-muted px-1.5 py-0.5">beam 3000</code>
              </p>
            </div>
          )}
        </motion.section>

        {/* Subdomains */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-foreground">Subdomains</h2>
            <Link
              href="/dashboard/subdomains"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Manage →
            </Link>
          </div>

          {!subdomains ? (
            <div className="rounded-2xl border border-border p-6 text-center">
              <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : subdomains.length > 0 ? (
            <div className="divide-y divide-border rounded-2xl border border-border bg-card overflow-hidden">
              {subdomains.slice(0, 3).map((sub) => (
                <div key={sub.id} className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Globe2 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">{sub.subdomain}</p>
                      <p className="text-xs text-muted-foreground">{sub.url.replace("https://", "")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {sub.status === "active" ? (
                      <span className="h-2 w-2 rounded-full bg-[linear-gradient(135deg,#FF0000,#00FF00,#0000FF)]" />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                    )}
                    <Link
                      href={`/dashboard/subdomains/${sub.subdomain}`}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))}
              {subdomains.length > 3 && (
                <Link
                  href="/dashboard/subdomains"
                  className="flex items-center justify-center gap-2 p-4 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  View all {subdomains.length} subdomains
                  <ChevronRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          ) : (
            <Link
              href="/dashboard/subdomains"
              className="flex items-center justify-center gap-3 rounded-2xl border border-dashed border-border p-6 text-muted-foreground transition-all hover-rainbow-border hover:text-foreground"
            >
              <Globe2 className="h-5 w-5" />
              <span className="text-sm">Reserve your first subdomain</span>
            </Link>
          )}
        </motion.section>

        {/* Status */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-foreground">Status</h2>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 rainbow-top-line overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground">System Status</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[linear-gradient(135deg,#FF0000,#00FF00,#0000FF)]" />
                <span className="text-xs text-beam-rainbow">Operational</span>
              </div>
            </div>
            {!hasCloudflareKey && (
              <Link
                href="/dashboard/settings"
                className="mt-4 flex items-center justify-between rounded-xl bg-amber-50 p-3 text-sm text-amber-700 transition-colors hover:bg-amber-100 dark:bg-amber-950/50 dark:text-amber-400 dark:hover:bg-amber-950"
              >
                <span>Configure Cloudflare API key for full features</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </motion.section>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete tunnel?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{tunnelToDelete?.name}&quot;
              {tunnelToDelete?.tunnelType !== "quick" && " and remove it from Cloudflare"}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
