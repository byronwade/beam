"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { Globe2, Plus, Trash2, Copy, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import type { Id } from "../../../convex/_generated/dataModel";

interface SubdomainsSectionProps {
  userId: Id<"users"> | undefined;
}

export function SubdomainsSection({ userId }: SubdomainsSectionProps) {
  const [newSubdomain, setNewSubdomain] = useState("");
  const [isReserving, setIsReserving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const subdomains = useQuery(api.subdomains.listByUser, userId ? { userId } : "skip");
  const reserveSubdomain = useMutation(api.subdomains.reserve);
  const releaseSubdomain = useMutation(api.subdomains.release);
  const checkAvailability = useQuery(
    api.subdomains.checkAvailability,
    newSubdomain.length >= 3 ? { subdomain: newSubdomain } : "skip"
  );

  const handleReserve = async () => {
    if (!userId || !newSubdomain) return;
    setIsReserving(true);
    try {
      const result = await reserveSubdomain({
        userId,
        subdomain: newSubdomain.toLowerCase().trim(),
      });
      if (result.success) {
        toast.success("Subdomain reserved");
        setNewSubdomain("");
        setShowForm(false);
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Failed to reserve");
    } finally {
      setIsReserving(false);
    }
  };

  const handleDelete = async (subdomain: string) => {
    if (!userId) return;
    setDeletingId(subdomain);
    try {
      const result = await releaseSubdomain({ userId, subdomain });
      if (result.success) {
        toast.success("Released");
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Failed to release");
    } finally {
      setDeletingId(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied");
  };

  const isAvailable = checkAvailability?.available ?? false;

  return (
    <div className="rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center justify-between border-b border-neutral-200 p-4 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <Globe2 className="h-4 w-4 text-neutral-500" />
          <span className="text-sm font-medium text-neutral-900 dark:text-white">Subdomains</span>
          {subdomains && subdomains.length > 0 && (
            <span className="text-xs text-neutral-400">{subdomains.length}</span>
          )}
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-md p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white"
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="border-b border-neutral-200 p-4 dark:border-neutral-800">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="my-app"
                    value={newSubdomain}
                    onChange={(e) =>
                      setNewSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                    }
                    className="h-9 w-full rounded-lg border border-neutral-200 bg-transparent px-3 text-sm outline-none transition-colors placeholder:text-neutral-400 focus:border-neutral-400 dark:border-neutral-700 dark:focus:border-neutral-500"
                  />
                </div>
                <button
                  onClick={handleReserve}
                  disabled={!isAvailable || isReserving || newSubdomain.length < 3}
                  className="h-9 rounded-lg bg-neutral-900 px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
                >
                  {isReserving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reserve"}
                </button>
              </div>
              {newSubdomain.length >= 3 && (
                <p className={`mt-2 text-xs ${isAvailable ? "text-emerald-500" : "text-red-500"}`}>
                  {isAvailable ? "Available" : checkAvailability?.reason || "Not available"}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
        {!subdomains ? (
          <div className="p-4">
            <Loader2 className="mx-auto h-5 w-5 animate-spin text-neutral-400" />
          </div>
        ) : subdomains.length > 0 ? (
          subdomains.map((sub) => (
            <div
              key={sub.id}
              className="group flex items-center justify-between p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-neutral-900 dark:text-white">
                    {sub.subdomain}
                  </span>
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      sub.status === "active" ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                  />
                </div>
                <p className="mt-0.5 truncate text-xs text-neutral-400">
                  {sub.url.replace("https://", "")}
                </p>
              </div>
              <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => copyToClipboard(sub.url)}
                  className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(sub.subdomain)}
                  disabled={deletingId === sub.subdomain}
                  className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950"
                >
                  {deletingId === sub.subdomain ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 text-center">
            <p className="text-sm text-neutral-500">No subdomains</p>
          </div>
        )}
      </div>
    </div>
  );
}
