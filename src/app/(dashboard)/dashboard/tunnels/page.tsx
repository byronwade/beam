"use client";

import { useQuery, useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useAuth } from "@/lib/auth-context";
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
import { toast } from "sonner";
import { Copy, Trash2, Loader2, Cable, Terminal } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";

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

export default function TunnelsPage() {
  const { user } = useAuth();
  const tunnels = useQuery(api.tunnels.list, user?.id ? { userId: user.id } : "skip") as Tunnel[] | undefined;
  const deleteTunnelAction = useAction(api.cloudflareKeys.deleteTunnelAction);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tunnelToDelete, setTunnelToDelete] = useState<Tunnel | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
      toast.error("Failed to delete tunnel");
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

  const getCliCommand = (tunnel: Tunnel) => {
    if (tunnel.tunnelType === "quick") {
      return `beam quick ${tunnel.port}`;
    }
    return `beam connect ${tunnel.port} --name ${tunnel.name}`;
  };

  const isLoading = tunnels === undefined;
  const activeTunnels = tunnels?.filter(t => t.status === "active") || [];
  const inactiveTunnels = tunnels?.filter(t => t.status !== "active") || [];

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 pb-28">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">Tunnels</h1>
        <p className="mt-1 text-sm text-neutral-500">View and manage your tunnel connections</p>
      </div>

      {/* Stats */}
      <div className="mt-8 flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-neutral-600 dark:text-neutral-400">{activeTunnels.length} active</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-neutral-300 dark:bg-neutral-600" />
          <span className="text-neutral-600 dark:text-neutral-400">{inactiveTunnels.length} inactive</span>
        </div>
      </div>

      {/* List */}
      <div className="mt-8 space-y-2">
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl bg-neutral-50 p-5 dark:bg-neutral-900">
              <div className="flex items-center gap-3">
                <div className="h-2.5 w-2.5 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                <div className="h-4 w-32 rounded bg-neutral-200 dark:bg-neutral-700" />
              </div>
            </div>
          ))
        ) : tunnels && tunnels.length > 0 ? (
          tunnels.map((tunnel) => (
            <div
              key={tunnel._id}
              className="group rounded-2xl bg-neutral-50 p-5 transition-colors hover:bg-neutral-100 dark:bg-neutral-900 dark:hover:bg-neutral-800/80"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`h-2.5 w-2.5 rounded-full ${
                    tunnel.status === "active"
                      ? "bg-emerald-500"
                      : tunnel.status === "pending"
                        ? "bg-amber-500"
                        : "bg-neutral-300 dark:bg-neutral-600"
                  }`} />
                  <span className="font-medium text-neutral-900 dark:text-white">{tunnel.name}</span>
                  <span className="rounded-full bg-neutral-200/60 px-2 py-0.5 text-[11px] text-neutral-500 dark:bg-neutral-700/60 dark:text-neutral-400">
                    {tunnel.tunnelType}
                  </span>
                </div>
                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => copyToClipboard(getCliCommand(tunnel))}
                    className="rounded-lg p-2 text-neutral-400 hover:bg-white hover:text-neutral-900 dark:hover:bg-neutral-700 dark:hover:text-white"
                    title="Copy CLI command"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      setTunnelToDelete(tunnel);
                      setDeleteDialogOpen(true);
                    }}
                    disabled={deletingId === tunnel.tunnelId}
                    className="rounded-lg p-2 text-neutral-400 hover:bg-white hover:text-red-600 dark:hover:bg-neutral-700"
                    title="Delete tunnel"
                  >
                    {deletingId === tunnel.tunnelId ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-4 text-sm text-neutral-500">
                <span>Port {tunnel.port}</span>
                <span>·</span>
                <span className="capitalize">{tunnel.status}</span>
                <span>·</span>
                <span>{formatDistanceToNow(tunnel.lastHeartbeat, { addSuffix: true })}</span>
              </div>

              {tunnel.quickTunnelUrl && (
                <div className="mt-3">
                  <button
                    onClick={() => copyToClipboard(tunnel.quickTunnelUrl!)}
                    className="text-sm text-emerald-600 hover:underline dark:text-emerald-400"
                  >
                    {tunnel.quickTunnelUrl}
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="py-20 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
              <Cable className="h-7 w-7 text-neutral-400" />
            </div>
            <p className="mt-5 text-sm text-neutral-600 dark:text-neutral-400">No tunnels yet</p>
            <p className="mt-1 text-xs text-neutral-400">Create tunnels using the CLI</p>
          </div>
        )}
      </div>

      {/* CLI Commands Help */}
      <div className="mt-12">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-neutral-400" />
          <h2 className="text-sm font-medium text-neutral-900 dark:text-white">Create tunnels via CLI</h2>
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between rounded-xl bg-neutral-50 px-4 py-3 dark:bg-neutral-900">
            <div>
              <code className="text-sm text-neutral-600 dark:text-neutral-400">beam quick 3000</code>
              <p className="mt-0.5 text-xs text-neutral-400">Quick tunnel with random URL</p>
            </div>
            <button
              onClick={() => copyToClipboard("beam quick 3000")}
              className="rounded-lg p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-neutral-50 px-4 py-3 dark:bg-neutral-900">
            <div>
              <code className="text-sm text-neutral-600 dark:text-neutral-400">beam connect 3000 --name my-app</code>
              <p className="mt-0.5 text-xs text-neutral-400">Named tunnel for tracking</p>
            </div>
            <button
              onClick={() => copyToClipboard("beam connect 3000 --name my-app")}
              className="rounded-lg p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
        </div>
        <p className="mt-4 text-xs text-neutral-400">
          First time? Run <code className="rounded bg-neutral-100 px-1.5 py-0.5 dark:bg-neutral-800">beam login</code> to authenticate
        </p>
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
